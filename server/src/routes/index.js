import { Router } from "express";
import healtcheckRoutes from './healthcheck.route.js'
import otpRoutes from './otp.route.js'
import locationRoutes from './location.route.js'

 
const router = Router()


router.use("/healtcheckup", healtcheckRoutes)
router.use("/otp-services", otpRoutes)
router.use("/location-services", locationRoutes)


export default router