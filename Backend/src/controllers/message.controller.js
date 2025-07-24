import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSiderbar= async (req, res) => {
    try {
        const loggedInUserId = req.user._id; // Assuming user ID is stored in req.user
        const filteredUsers = await User.find({_id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        clg.error("Error fetching users for sidebar:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId } = req.params;
        const myId= req.user._id; // Assuming user ID is stored in req.user

        const messages= await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error fetching getMessages controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text,image}= req.body;
        const {id: receiverId} = req.params;
        const myId= req.user._id; // Assuming user ID is stored in req.user ( apan protected route use karnar ahe, so hamesha asnar)

        let imageUrl = null;
        if(image){
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url;
        }

        const newMessage = new Message({
            text,
            image: imageUrl,
            senderId: myId,
            receiverId
        });

        await newMessage.save();

        //realtime function ikde using socket io

        res.status(201).json(newMessage);
        
    } catch (error) {
        console.log("Error sending message:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}