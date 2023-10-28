import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";


const app = express();
const port = 3000;

app.use(express.static("public/"));
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const apiKey = "YOUR API HERE";
const API_URL = "https://api.cloudmersive.com";


app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/artistic", upload.single('imageFile'), async (req, res) => {
    try {
        // Através da submissão do post, adquirimos o estilo e a imagem
        const style = req.body.style;
        const imageFile = req.file.buffer;
        const formData = new FormData();
        formData.append('style', style);
        formData.append("imageFile", imageFile, { filename: "temp.png" });

        // Chamada à API da cloudmersive
        const response = await axios.post(
            `${API_URL}/image/artistic/painting/${style}`,
            formData,
            {
                headers: {
                    "Apikey": apiKey,
                }
            }
        );
        
        // Salvar a imagem temporariamente no servidor
        const tempImagePath = 'public/images/output.jpg'; // Caminho temporário para salvar a imagem
        const fileStream = fs.createWriteStream(tempImagePath);
        res.render("index.ejs", { image: tempImagePath });

    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Erro a processar a imagem!" });
    }
})


app.listen(port, () => {
    console.log(`Server running in port ${port}...`);
})


