import mongoose, { Schema, Document } from 'mongoose';

// Interface for task document
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags?: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
    completedAt: {
      type: Date,
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
