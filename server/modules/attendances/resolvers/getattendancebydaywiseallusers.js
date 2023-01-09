const { paramHandler } = require('../../../utils/paramhandler');
const Attendance = require('../../../models/attendances');
const ShiftRosters = require('../../../models/shift-roster');
const Users = require('../../../models/user');
const ObjectID = require("mongodb").ObjectID

const getAttendancesByDayWiseAllUsers = async (_, args, { me, tenantid })  => new Promise(async (resolve, reject) => {
  const param = me?.user?.username === 'gonngod' ? paramHandler({...args.query}): paramHandler({...args.query, tenantid});
  let gte_date = args.query.dates.gte ? new Date(args.query.dates.gte): new Date('July 20, 69 20:17:40 GMT+00:00');

  try {
    await Attendance.aggregate([
        {
            $match: { 
                $and: [
                    { 
                        date: { 
                            $gte: args.query.dates.gte ? new Date(args.query.dates.gte): new Date('July 20, 69 20:17:40 GMT+00:00'), 
                            $lt: args.query.dates.lt ? new Date(args.query.dates.lt): new Date()
                        }
                    },
                ]
             },
        },
        {
            $lookup: {
                from: "Users",
                localField: "userId",
                foreignField: "_id",
                as: "user_data"
            }
        },
        {
            $set: {
                username: { $arrayElemAt: ["$user_data.username", 0] },
            }
        },
        {
            $group : {
                all_users_lookup : { $first: "$all_users_lookup"},
                day: { $first: "$date"},
                date: { $first: "$date"},
                month: { $first: "$date"},
                _id:{
                    $dateToString:
                       {
                          format: "%Y-%m-%d",
                          date: "$date"
                       }
                },
                punchIn: { $first:"$inTime" },
                punchOuts: { $push: "$outTime" },
                userId: { $first: "$userId" },
                user: { $first: "$user" },
                comments: { $first: "$comments" },
                username: { $first: "$username" },
                all_swipes: { $push: { punchIn: "$inTime", punchOut: "$outTime" } },
            }
        },
        {
            $set: {
                punchOutArr: { 
                    $filter: {
                        input: "$punchOuts",
                        as: "punchOuts", 
                        cond: { 
                            $and: [
                                {
                                    $ne: [ "$$punchOuts", null ]
                                },
                            ]
                         }
                    }
                },
            }
        },
        {
            $project: {
                _id: 1,
                day: 1,
                month: {
                    $dateToString: {
                        format: "%Y-%m-01T00:00:00.000Z",
                        date: "$month"
                    }
                },
                date: 1,
                userId: 1,
                username: 1,
                punchIn: 1,
                punchOutArr: 1,
                user: 1,
                all_swipes: 1
            }
        },
        {
            $lookup: {
                from: "ShiftRosters",
                localField: "month",
                foreignField: "month",
                as: "shift_roster_users"
            }
        },
        {
            $unwind: {
                path: "$shift_roster_users.users",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                dateFormatted: {
                    $dateToString: {
                        format: "%Y-%m-%dT18:30:00.000Z",
                        date: "$date"
                    }
                }
            }
        },
        {
            $set: {
                dateFormatted: {
                    $toDate: "$dateFormatted"
                }
            }
        },
        {
            $group: {
                _id : "$_id",
                day: { $first: "$day" },
                dateFormatted: { $first: "$dateFormatted" },
                date: { 
                    $first: {
                        $dateToString: {
                            format: "%Y-%m-%dT00:00:00.000Z",
                            date: "$date"
                        }
                    } 
                },
                month: { $first: "$month" },
                userId: { $first: "$userId" },
                username: { $first: "$username" },
                punchIn: { $first: "$punchIn" },
                punchOut: { $push: { $ifNull: [ { $arrayElemAt: [ "$punchOutArr", -1 ] }, null ] } },
                totalHours: { $first: "$totalHours" },
                rosterUserz: { $first: "$shift_roster_users.users" },
                all_swipes: { $first: "$all_swipes" }
            }
        },
        {
            $unwind: {
                path: "$rosterUserz",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                rosterUser: {
                    $filter: {
                        input: "$rosterUserz",
                        as: "rosterUserz", 
                        cond: { 
                            $and: [
                                { $eq: [ "$$rosterUserz.username", "$username" ] },
                            ]
                         }
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$rosterUser",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$punchOut",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
              _id: 1,
              day: 1,
              date: 1,
              dateFormatted: 1,
              month: 1,
              userId: 1,
              username: 1,
              punchIn: 1,
              punchOut: 1,
              totalHours: 1,
              rosterUserz: 1,
              rosterUser: 1,
              rosterDateRange: "$rosterUser.dateRange",
              year : { $year : "$day" }, 
              week : { $week : "$day" },
              day: { $dayOfMonth: "$day" },
              all_swipes: 1
            }
        },
        {
            $set: {
                totalHours: {
                    $divide: [
                        {
                            $dateDiff: {
                                startDate: "$punchIn",
                                endDate: "$punchOut",
                                unit: "minute"
                            }
                        }, 60
                    ]
                },
                punchIn: {
                    $dateToString: {
                        format: "%H:%M",
                        date: "$punchIn"
                    }
                },
                punchOut: {
                    $dateToString: {
                        format: "%H:%M",
                        date: "$punchOut"
                    }
                }
            }
        },
        {
            $set: {
                user_roster: {
                    $filter: { 
                        input: "$rosterDateRange",
                        as: "rosterDateRange", 
                        cond: { $eq: [ "$$rosterDateRange.date", "$date" ] }
                    }
                },
            }
        },
        {
            $unwind: {
                path: "$user_roster",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "Shifts",
                localField: "user_roster.shifts",
                foreignField: "code",
                as: "shift_data"
            }
        },
        {
            $set: {
                userShiftDefaultTimeFrom: { $arrayElemAt: ["$shift_data.general.defaultTimeFrom", 0] }
            }
        },
        {
            $unwind: {
                path: "$userShiftDefaultTimeFrom",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                userShiftName: { $arrayElemAt: ["$shift_data.name", 0] },
                userShiftMinHours: { $arrayElemAt: ["$shift_data.workingHours.minimumHoursRequired", 0] },
                overtime: { $subtract: ["$totalHours", { $arrayElemAt: ["$shift_data.workingHours.minimumHoursRequired", 0] }] },
                userShiftDefaultTimeFrom: {
                    $dateFromString: {
                        dateString: {$concat: [ "1970-01-01T", { "$substr": [ { $ifNull: [ "$userShiftDefaultTimeFrom", "00:00" ] }, 0, 5 ] }, ":00.000"]},
                   }
                },
                userPunchInConvertedTemp: {
                    $dateFromString: {
                        dateString: {$concat: [ "1970-01-01T", { "$substr": [ { $ifNull: [ "$punchIn", "00:00" ] }, 0, 5 ] }, ":00.000"]},
                   }
                },
                userPunchOutConvertedTemp: {
                    $dateFromString: {
                        dateString: {$concat: [ "1970-01-01T", { "$substr": [ { $ifNull: [ "$punchOut", "00:00" ] }, 0, 5 ] }, ":00.000"]},
                   }
                },
            }
        },
        {
            $set: {
                user_is_early_late: {
                    $dateDiff: {
                        startDate: "$userShiftDefaultTimeFrom",
                        endDate: "$userPunchInConvertedTemp",
                        unit: "minute"
                    }
                }
            }
        },
        {
          $project: {
            shift_data: 0,
            rosterUser: 0,
            rosterUserz: 0,
            rosterDateRange: 0,
            userPunchInConvertedTemp: 0,
            userPunchOutConvertedTemp: 0,
            userShiftDefaultTimeFrom: 0,
          }
        },
        {
            $group: {
                _id : "$_id",
                day: { $first: "$day" },
                date: { $first: "$date" },
                dateFormatted: { $first: "$dateFormatted" },
                month: { $first: "$month" },
                userId: { $first: "$userId" },
                username: { $first: "$username" },
                punchIn: { $first: "$punchIn" },
                punchOut: { $first: "$punchOut" },
                totalHours: { $first: "$totalHours" },
                user_roster: { $first: "$user_roster" },
                userShiftName: { $first: "$userShiftName" },
                userShiftMinHours: { $first: "$userShiftMinHours" },
                overtime: { $first: "$overtime" },
                user_is_early_late: { $first: "$user_is_early_late" },
                all_swipes: { $first: "$all_swipes" },
            }
        },
        {
            $addFields: {
                days_diff: {
                    $divide: [
                        {
                            $subtract: [
                                args.query.dates.lt ? new Date(args.query.dates.lt): new Date(),
                                args.query.dates.gte ? new Date(args.query.dates.gte): new Date('July 20, 69 20:17:40 GMT+00:00'),
                            ],
                        },
                        86400000.0,
                    ],
                },
            }
        },
        {
            $addFields: {
                dates_in_between: {
                    $map: {
                      input: {
                        $range: [
                          0,
                          {
                            $toInt: {
                              $add: ["$days_diff", 2],
                            },
                          },
                        ],
                      },
                      as: "dd",
                      in: {
                        $add: [
                            gte_date,
                            {
                                $multiply: ["$$dd", 86400000],
                            },
                        ],
                      },
                    },
                },
            }
        }
    ])
    .exec(async function ( e, d ) {
        if(d) {

            const final_response = [];

            const all_db_users = await Users.find({});
            const combind = { attendance_data: d, all_users: all_db_users, dates_in_between: d[0].dates_in_between }
            // console.log(combind);


            combind.dates_in_between.forEach(each_day => {
                combind.attendance_data.length && combind.attendance_data.forEach( atten => {
                    if(atten.dateFormatted - each_day === 0) {
                        isUserExists = combind.all_users.filter( user => atten.userId.equals(user._id));
                        console.log(isUserExists);
                        final_response.push({
                            user: isUserExists,
                            attendance: atten || { absent: 1 }
                        });
                    }
                });
                // combind.all_users.forEach(each_user => {
                //     final_response.push({
                //         user: each_user,
                //         attendance: isAttenExists || { absent: 1 }
                //     });
                // }); // Each user
            }); // Each Day

            resolve([combind])
        }
        if (e) return reject(new Error(e));
        // resolve(d)        
    });
  }
  catch (e) {
    reject(e);
  }
});

module.exports = getAttendancesByDayWiseAllUsers;
