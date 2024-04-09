/* eslint-disable no-console */
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import authRoutes from '~/routes/auth.js'
import userRoutes from '~/routes/users.js'
import postRoutes from '~/routes/posts.js'
import { register } from '~/controllers/auth.js'
import { createPost } from '~/controllers/posts.js'
import { verifyToken } from '~/middleware/auth.js'

/* CONFIGURATIONS */
const __filename = process.cwd()
const __dirname = path.dirname(__filename)
dotenv.config()

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage })

const START_SERVER = async () => {
  const app = express()
  app.use(express.json())
  app.use(helmet())
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
  app.use(morgan('common'))
  app.use(bodyParser.json({ limit: '30mb', extended: true }))
  app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
  app.use(cors())
  app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
  })

  /* ROUTES REGISTER */
  app.post('/auth/register', upload.single('picture'), register)
  app.post('/posts', verifyToken, upload.single('picture'), createPost)

  /* ROUTES */
  app.use('/auth', authRoutes)
  app.use('/users', userRoutes)
  app.use('/posts', postRoutes)
}

/* MONGOOSE SETUP */
// const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGODB_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    START_SERVER()
  })
  .catch((err) => {
    console.log(err)
    process.exit(0)
  })
