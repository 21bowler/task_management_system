import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/models/user.model';

// Interface for task document
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags?: string[];
  assignedTo?: mongoose.Types.ObjectId | IUser;
  sharedWith?: mongoose.Types.ObjectId | IUser[];
  comments?: IComment[];
  activityLog?: IActivityLog[];
  createdBy: mongoose.Types.ObjectId | IUser;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Comments Interface
interface IComment extends Document {
  content: string;
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
}

//Activity Log
interface IActivityLog extends Document {
  action:
    | 'created'
    | 'updated'
    | 'commented'
    | 'assigned'
    | 'shared'
    | 'status-changed'
    | 'priority-changed';
  performedBy: mongoose.Types.ObjectId | IUser;
  timestamp: Date;
  details?: string;
}

// Comment Schema
const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required.'],
      trim: true,
      maxlength: [500, 'Comment content cannot be more than 500 characters.'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who created the comment is required.'],
    },
  },
  { timestamps: true },
);

// Activity log Schema
const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    enum: [
      'created',
      'updated',
      'commented',
      'assigned',
      'shared',
      'status-changed',
      'priority-changed',
    ],
    required: [true, 'Action is required'],
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who performed the action is required.'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
    trim: true,
  },
});

// Schema definition
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      maxlength: [100, 'Task title cannot be more than 100 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters.'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'in-progress', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [CommentSchema],
    activityLog: [ActivityLogSchema],
    completedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who created the task is required.'],
    },
  },
  {
    timestamps: true,
  },
);

// pre-save middleware
TaskSchema.pre('save', function (next) {
  //Gives a date to a completed task already marked as completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

//Checks if the model exists to prevent overwriting it
const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
