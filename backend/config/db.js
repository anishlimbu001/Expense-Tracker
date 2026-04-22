import mongoose from 'mongoose';

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://anishlimbu001_db_user:I4pvH2DinPOf24LU@cluster0.umquli1.mongodb.net/Expense")
    .then(() => console.log("DB CONNECTED"));
}