const Analytics = require("../models/Analytics");
const Link = require("../models/Link");

exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const sortOrder = order === "asc" ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };

        const userLinks = await Link.find({ user: userId }).skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort(sortOptions);

        const linkIds = userLinks.map((link) => link._id);

        const analytics = await Analytics.find({ link: { $in: linkIds } })
            .populate("link", "shortLink originaLink")
            .sort({ accessedAt: -1 });

        const totalAnalytics = analytics.length;

        const totalPages = Math.ceil(totalAnalytics / limitNum);

        res.status(200).json({
            success: true,
            message: "Analytics fetched successfully",
            data: {
                analytics,
                pagination: {
                    totalAnalytics,
                    totalPages,
                    currentPage: pageNum,
                    limit: limitNum,
                }
            }
        });
    } catch (error) {
        console.error("Error fetching user's analytics:", error);
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
}

exports.trackAnalytics = async (req, res) => {
    try {
        const { linkId, deviceType, browser, ipAddress } = req.body;

        const link = await Link.findById(linkId);
        if (!link) {
            return res.status(404).json({ message: "Link not found" });
        }

        const analyticsEntry = await Analytics.create({
            link: linkId,
            deviceType,
            browser,
            ipAddress,
        });

        res.status(201).json({ message: "Analytics tracked successfully", analytics: analyticsEntry });
    } catch (error) {
        res.status(500).json({ message: "Error tracking analytics", error: error.message });
    }
};

exports.getAnalyticsForLink = async (req, res) => {
    try {
        const { linkId } = req.params;

        const analyticsData = await Analytics.find({ link: linkId });

        res.status(200).json({ analytics: analyticsData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
};

exports.dashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const userLinks = await Link.find({ user: userId }).select('_id');
        const linkIds = userLinks.map((link) => link._id);


        if (!linkIds.length) {
            return res.status(200).json({
                success: true,
                message: "No links found for this user.",
                dateWiseAnalytics: [],
                deviceWiseAnalytics: [],
                totalClicks: 0,
            });
        }

        const analyticsData = await Analytics.aggregate([
            { $match: { link: { $in: linkIds } } }, 
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$accessedAt' } }, 
                        deviceType: '$deviceType', 
                    },
                    dailyClicks: { $sum: 1 }, 
                },
            },
            {
                $group: {
                    _id: '$_id.date', 
                    devices: {
                        $push: {
                            deviceType: '$_id.deviceType',
                            clicks: '$dailyClicks',
                        },
                    },
                    totalClicks: { $sum: '$dailyClicks' }, 
                },
            },
            { $sort: { _id: 1 } }, 
        ]);


        let cumulativeClicks = 0;
        const dateWiseAnalytics = analyticsData.map((data) => {
            cumulativeClicks += data.totalClicks;
            return {
                date: data._id,
                totalClicks: cumulativeClicks,
                cumulativeClicks,
                devices: data.devices,
            };
        });


        const deviceWiseAnalytics = await Analytics.aggregate([
            { $match: { link: { $in: linkIds } } },
            {
                $group: {
                    _id: '$deviceType', 
                    clicks: { $sum: 1 },
                },
            },
            { $sort: { clicks: -1 } }, 
        ]);

        const totalClicks = await Analytics.countDocuments({ link: { $in: linkIds } });

        

        res.status(200).json({
            success: true,
            dateWiseAnalytics: dateWiseAnalytics.reverse(), 
            deviceWiseAnalytics,
            totalClicks,
        });

    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard analytics',
            error: error.message,
        });
    }
}
