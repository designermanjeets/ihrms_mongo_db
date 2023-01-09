const { paramHandler } = require('../../../utils/paramhandler');
const Attendance = require('../../../models/attendances');
const ShiftRosters = require('../../../models/shift-roster');

const getAttendancesByDayWiseAvg = async (_, args, { me, tenantid })  => new Promise(async (resolve, reject) => {
  const param = me?.user?.username === 'gonngod' ? paramHandler({...args.query}): paramHandler({...args.query, tenantid});
  try {
    await Attendance.aggregate([
        { 
            $match: {
                $expr : { 
                    $and: [
                        { $eq: [ '$userId' , { $toObjectId: args.query.userID } ] },
                    ]
                }
            }
        },
        {
            $match: {
                $and: [
                    {
                        date: { 
                            $gte: args.query.dates?.gte ? new Date(args.query?.dates?.gte): new Date('July 20, 69 20:17:40 GMT+00:00'), 
                            $lt: args.query.dates?.lt ? new Date(args.query?.dates?.lt): new Date()
                        }
                    }
                ]
            }
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
                punchOut: { $last:"$outTime" },
                userId: { $first: "$userId" },
                user: { $first: "$user" },
                comments: { $first: "$comments" },
                username: { $first: "$username" },
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
                },
                user: 1,
                totalHours: {
                    $divide: [
                      { $subtract: ["$punchOut", "$punchIn"] },
                      60 * 1000 * 60
                    ]
                  }
                 
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
            $group: {
                _id : "$_id",
                day: { $first: "$day" },
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
                punchOut: { $first: "$punchOut" },
                totalHours: { $first: "$totalHours" },
                rosterUserz: { $first: "$shift_roster_users.users" },
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
            $project: {
              _id: 1,
              day: 1,
              date: 1,
              month: 1,
              userId: 1,
              username: 1,
              punchIn: 1,
              punchOut: 1,
              totalHours: 1,
              rosterUserz: 0,
              rosterUser: 1,
              rosterDateRange: "$rosterUser.dateRange",
              year : { $year : "$day" }, 
              week : { $week : "$day" },
              day: { $dayOfMonth: "$day" },
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
                userShiftName: { $arrayElemAt: ["$shift_data.name", 0] },
                userShiftMinHours: { $arrayElemAt: ["$shift_data.workingHours.minimumHoursRequired", 0] },
                overtime: { $subtract: ["$totalHours", { $arrayElemAt: ["$shift_data.workingHours.minimumHoursRequired", 0] }] }
            }
        },
        {
          $project: {
            shift_data: 0,
            rosterUser: 0,
            rosterDateRange: 0,
          }
        },
        {   
            $group : {
                _id : {
                    year : "$year",                      
                    week : "$week"
                },
                totalHoursAvg:{ $avg: "$totalHours" }, 
            }
        }
    ])
    .exec(async function ( e, d ) {
        if (e) return reject(new Error(e));
        resolve(d)        
    });
  }
  catch (e) {
    reject(e);
  }
});

module.exports = getAttendancesByDayWiseAvg;
