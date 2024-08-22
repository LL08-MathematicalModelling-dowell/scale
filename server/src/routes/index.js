import { Router } from "express";
import healtcheckRoutes from './healthcheck.route.js'
import otpRoutes from './otp.route.js'

 
const router = Router()


router.use("/healtcheckup", healtcheckRoutes)
router.use("/otp-services", otpRoutes)


export default router