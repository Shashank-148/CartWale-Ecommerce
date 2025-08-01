import { Inngest } from "inngest";
import User from '../models/User';
import connectDB from "./db";
import Order from "@/models/order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "cartwale-next" });

// Ingest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk'
    },
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            imageUrl: image_url,
        }
        await connectDB();
        await User.create(userData);
    }
)

// inngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk'
    },
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            imageUrl: image_url,
        }
        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    }
)

// inngest function to delete user data in database
export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk'
    },
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data;
        await connectDB();
        await User.findByIdAndDelete(id);
    }
)

// ingest to create user order in database
export const createUserOrder = inngest.createFunction(
    {
        id:'create-user-order',
        batchEvents:{
            maxSize: 25,
            timeout: '5s'
        }
    },
    {event: 'order/created'},
    async ({events}) => {
        const orders = events.map((event) => {
            return {
                userId: event.data.userId,
                items: event.data.items,
                amount: event.data.amount,
                address: event.data.address,
                date: event.data.event
            }
        })

        await connectDB()
        await Order.insertMany(orders)

        return {success: true, processed: orders.length };
    }
)
