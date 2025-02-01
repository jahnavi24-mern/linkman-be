require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    const { name, email, password, confirmPassword, mobile } = req.body;

    try {
        const existingEmail = await User.findOne({ email });
        if(existingEmail){
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Check password match
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and confirm password must be same"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({ 
            name: name, 
            mobile: mobile,
            email, 
            password: hashedPassword
        });


        return res.status(201).json({
            success: true,
            message: "User created successfully with default workspace",
            user: newUser,
        });

    } catch(error) {
        console.error("Signup Error:", error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while signing up"
        });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User with this email does not exist"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        // Create token with user ID
        const token = jwt.sign(
            { id: user._id },  // Make sure it's 'id' here
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error signing in'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or invalid"
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            user
        });
    } catch(error) {
        console.error("Profile Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "An error occurred while getting the profile"
        });
    }
}

exports.editProfile = async (req, res) => {
    try{
        const { userName, email, mobile } = req.body;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate({_id: userId}, { name: userName, email, mobile });
        
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    }catch(error){
        res.status(500).json({ 
            success: false,
            message: "An error occurred while editing the profile"
        });
    }
}