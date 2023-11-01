import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";


const app = express();
const port = 3000;


const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
console.log(__dirname);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const apiKey = "591cfdd3-dc9a-4caf-a73c-9e7215c7cf62";
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
                    ...formData.getHeaders(),
                    "Apikey": apiKey,
                },
                responseType: 'stream'
            },
        );
        
        const outputFile = response.headers["content-disposition"].match(/filename="([^"]+)"/);
        const fileName = outputFile[1];
        // console.log(JSON.stringify(response.headers));
        // console.log(JSON.stringify(response.headers["content-disposition"]));
        
        // Salvar a imagem no servidor
        const tempImagePath = path.join(__dirname, 'public', 'images', fileName);
        const fileStream = fs.createWriteStream(tempImagePath);
        response.data.pipe(fileStream);
        res.render("index.ejs", { image: `/images/${fileName}` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Erro a processar a imagem!" });
    }
})


app.listen(port, () => {
    console.log(`Server running in port ${port}...`);
})


