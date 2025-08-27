import axios from "axios";
import FormData from "form-data";
import userModel from "../models/userModel.js";

export const generateImage = async (req, res) => {
  try {
    const { id } = req.user;       
    const { prompt } = req.body;  

    if (!prompt) {
      return res.json({ success: false, message: "Missing prompt" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.creditBal <= 0) {
      return res.json({ success: false, message: "Not Enough Credits", creditBalance: user.creditBal });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        "x-api-key": process.env.CLIPDROP_API,
        ...formData.getHeaders(),
      },
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // decrement credits
    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { creditBal: user.creditBal - 1 },
      { new: true }    // ✅ return updated user
    );

    res.json({
      success: true,
      message: "Image Generated",
      creditBal: updatedUser.creditBal,
      resultImage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
