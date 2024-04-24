import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller";

const router = Router();

router.use(verifyJWT);

router.route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u:/subscirberId").get(getUserChannelSubscribers);

export default router
