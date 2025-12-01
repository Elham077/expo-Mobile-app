import { firestore } from "@/config/firebase.client";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageServices";
import { deleteApp } from "firebase/app";
export const createOrUpdateWallet = async (
    walletData: Partial<WalletType>
): Promise<ResponseType>=>{
    try{
        let walletToSave = {...walletData};
        if(walletData){
            if(walletData.image){
                        const imageUploadRes = await uploadFileToCloudinary(walletData.image, "wallets");
                        if(!imageUploadRes.success){
                            return {success: false, msg: imageUploadRes.msg || "Failed to upload wallet"}
                        }
                        walletToSave.image = imageUploadRes.data;
            }
        }
        if(!walletData?.id){
            // new wallet 
            walletToSave.amount = 0;
            walletToSave.totalIncome= 0;
            walletToSave.totalExpenses = 0;
            walletToSave.created = new Date();
        }
        const walletRef = walletData?.id
         ? doc(firestore, "wallets", walletData?.id)
         : doc(collection(firestore, "wallets"));
        await setDoc(walletRef, walletToSave, {merge: true})//update only the data provided
        return {success: true, data: {...walletToSave,id:walletRef.id}};
    }catch(error: any){
        console.log("error creating or updating wallet: ", error);
        return {success: false, msg: error.message}
    }
}

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
    try{
        const walletRef = doc(firestore, "wallets", walletId)
        await deleteDoc(walletRef);

        deleteTransactionByWalletId(walletId);        
        return {success: true, msg: "wallet Delated successfully"}
    }catch(err: any){
        console.log("error deleting wallet: ", err);
        return {success: false,msg: err.message}
    }
}
export const deleteTransactionByWalletId = async (walletId: string): Promise<ResponseType> => {
    try{
        let hasMoreTransactions = true;
        while(hasMoreTransactions){
            const transactionsQuery = query(
                collection(firestore, "transactions"),
                where('walletId', '==', walletId)
            );
            const transactionsSnapshot = await getDocs(transactionsQuery)
            if(transactionsSnapshot.size == 0){
                hasMoreTransactions = false;
                break;
            }
            const batch = writeBatch(firestore);
            transactionsSnapshot.forEach((transactionDoc)=> {
                batch.delete(transactionDoc.ref);
            }) 
            await batch.commit();
            console.log('====================================');
            console.log(`${transactionsSnapshot.size} transactions deleted in this batch`);
            console.log('====================================');
        }   
        return {success: true, msg: "All Transactions deleted successFully"}

        return {success: true, msg: "wallet Delated successfully"}
    }catch(err: any){
        console.log("error deleting wallet: ", err);
        return {success: false,msg: err.message}
    }
}