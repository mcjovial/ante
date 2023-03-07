import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from 'app-request';
import crypto from 'crypto';
import UserRepo from '../../database/repository/UserRepo';
import { BadRequestError } from '../../core/ApiError';
import User from '../../database/model/User';
import { createTokens } from '../../auth/authUtils';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import bcrypt from 'bcrypt';
import { RoleCode } from '../../database/model/Role';
import { getUserData } from './utils';

const router = express.Router();

router.post(
  '/',
  validator(schema.signup),
  asyncHandler(async (req: RoleRequest, res) => {
    console.log(req.body);
    
    const user = await UserRepo.findByEmail(req.body.email);
    if (user) throw new BadRequestError('User already registered');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const newUser = {
      from: 'custom-db',
      password: passwordHash,
      data: {
        displayName: req.body.displayName,
        profilePicUrl: req.body.profilePicUrl,
        email: req.body.email
      }
    }

    const { user: createdUser, keystore } = await UserRepo.create(
      newUser as User,
      accessTokenKey,
      refreshTokenKey,
      RoleCode.LEARNER,
    );

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey,
    );
    const userData = await getUserData(createdUser);

    new SuccessResponse('Signup Successful', {
      user: userData,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    }).send(res);
  }),
);

export default router;
