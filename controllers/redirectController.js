const Link = require("../models/Link");
const Analytics = require("../models/Analytics");

exports.handleRedirect = async (req, res) => {
    try {
        const { shortLink } = req.params;

        const shortenedLink = req.protocol + "://" + req.get("host") + "/" + shortLink;
        const link = await Link.findOne({ shortLink: shortenedLink });
        if (!link) {
            return res.status(404).json({ message: "Shortened link not found" });
        }

        if (link.linkExpiration && new Date(link.linkExpiration) < new Date()) {
            return res.status(410).json({ message: "This link has expired" });
        }

        link.clicks += 1;
        await link.save();

        const deviceType = getDeviceType(req.headers["user-agent"]); 
        const browser = getBrowser(req.headers["user-agent"]);

        const ipAddress = req.ip; 

        await Analytics.create({
            link: link._id,
            deviceType,
            browser,
            ipAddress,
        });

        return res.redirect(link.originaLink);
    } catch (error) {
        console.error("Error handling redirect:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getDeviceType = (userAgent) => {
    if (/mobile/i.test(userAgent)) return "mobile";
    if (/tablet/i.test(userAgent)) return "tablet";
    return "desktop";
};

const getBrowser = (userAgent) => {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    return "Unknown";
};
