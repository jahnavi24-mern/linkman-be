require("dotenv").config();
const Link = require("../models/Link");
const crypto = require("crypto");

exports.createLink = async (req, res) => {
    try {
        const {destinationURL, remarks, linkExpiration} = req.body;

        const hashedId = crypto.randomBytes(4).toString("hex");
        
        const hostname = req.protocol + "://" + req.get("host");
        const shortLink = `${hostname}/${hashedId}`;

        const link = new Link({
            originaLink: destinationURL,
            shortLink,
            remarks,
            linkExpiration,
            user: req.user.id,
        });

        await link.save();

        res.status(201).json({
            success: true,
            message: "Link created successfully",
            data: link,
        });


    }catch(error) {
        console.error("Error while creating link:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while creating link"
        });
    }
}

exports.readLink = async (req, res) => {
    try {

        const id = req.params.id;

        const link = await Link.findById(id);


        res.status(200).json({
            success: true,
            message: "Link fetched successfully",
            data: link,
        });

    }catch(error) {
        console.error("Error while reading link:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while reading link"
        });
    }
}

exports.readAllLinksOfUser = async (req, res) => {
     try {
        const id = req.user.id;
        const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const sortOrder = order === "asc" ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };
        
        const links = await Link.find({user: id})
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort(sortOptions);

        const totalLinks = await Link.countDocuments({ user: id });

        const totalPages = Math.ceil(totalLinks / limitNum);
        
        res.status(200).json({
            success: true,
            message: "Links fetched successfully",
            data: {links,
            pagination: {
                totalLinks,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
            }
        }
        });

     }catch (error) {
        console.error("Error while reading links:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while reading link"
        });
     }
}

exports.editLink = async (req, res) => {
    try {
        const id = req.params.id; 
        const { destinationURL, remarks, linkExpiration } = req.body;

        const link = await Link.findById(id);


        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Link not found",
            });
        }

        if (destinationURL) {
            link.originaLink = destinationURL;
        }
        if (remarks) {
            link.remarks = remarks;
        }
        if (linkExpiration) {
            link.linkExpiration = new Date(linkExpiration);
        }

        const updatedLink = await link.save();

        res.status(200).json({
            success: true,
            message: "Link updated successfully",
            data: updatedLink,
        });

    }catch(error){
        console.error("Error while editing links:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while editing link"
        });
    }
}

exports.removeLink = async (req, res) => {
    try {
        const { id } = req.params; 

        const link = await Link.deleteOne({_id: id});

        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Link not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Link deleted successfully",
        });

    }catch(error){
        console.error("Error while deleting links:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while deleting link"
        });
    }
}

exports.searchLinksByRemarks = async (req, res) => {
    const { remark } = req.query;
  
    try {
      const links = await Link.find({ 
        remarks: { $regex: remark, $options: 'i' }
      });
  
      res.status(200).json(links);
    } catch (error) {
      res.status(500).json({ message: 'Error searching links', error });
    }
  };