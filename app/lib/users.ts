import bcrypt from "bcrypt";
import { getUserByEmail as firebaseGetUserByEmail, createUser } from "@/lib/firebase-data";

export const getUserByEmail = async (email: string) => {
    try {
        return await firebaseGetUserByEmail(email);
    } catch (err) {
        console.log(err);
    }
    return null;
}

export const CreateNewUser = async (userData: any) => {
    const {email, password, fullname} = userData;
    await createUser({
        email: email,
        password: password,
        fullname: fullname,
    });
}

export const hashPassword = async (password: string) => {
    const saltRound = 10;
    return await bcrypt.hash(password, saltRound);
}

export const compareHash = async (hash: string, password: string) => {
    return await bcrypt.compare(password, hash);
}
