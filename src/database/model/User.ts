import { model, Schema, Types } from 'mongoose';
import Role from './Role';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export default interface User {
  _id: Types.ObjectId;
  from?: string;
  password?: string;
  roles: Role[];
  data: UserData
  verified?: boolean;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  city: string;
  country: string;
  street: string;
}

interface UserData {
  displayName: string;
  firstName?: string;
  lastName?: string;
  profilePicUrl?: string;
  email: string;
  settings?: Settings
  shortcuts?: string[]
  address?: Address
}

interface Settings {
  layout: {
    style: string;
    config: {
      mode: string;
      scroll: string;
      navbar: {
        display: boolean;
      }
      toolbar: {
        display: boolean;
        position: string;
      }
      footer: {
        display: boolean;
        style: string;
      }
    }
  }
  customScrollbars: boolean;
  theme: {any: any}
}

const addressSchema = new Schema<Address>({
  city: String,
  country: String,
  street: String,
});

const settingsSchema = new Schema<Settings>({
  layout: {
    style: String,
    config: {
      mode: String,
      scroll: String,
      navbar: {
        display: Boolean,
      },
      toolbar: {
        display: Boolean,
        position: String,
      },
      footer: {
        display: Boolean,
        style: String,
      },
    },
  },
  customScrollbars: Boolean,
  // theme: {any: any},
})

const userDataSchema = new Schema<UserData>({
  email: {
    type: String,
    unique: true,
    required: true,
    // sparse: true, // allows null
    trim: true,
    select: false,
  },
  firstName: String,
  lastName: String,
  displayName: String,
  profilePicUrl: {
    type: Schema.Types.String,
    trim: true,
  },
  settings: settingsSchema,
  shortcuts: [{ type: String, lowercase: true, trim: true }],
  address: addressSchema,
})


const schema = new Schema<User>(
  {
    from: String,
    password: {
      type: Schema.Types.String,
      select: false,
    },
    roles: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
      required: true,
      select: false,
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
    data: userDataSchema,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

schema.index({ _id: 1, status: 1 });
schema.index({ email: 1 });
schema.index({ status: 1 });

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
