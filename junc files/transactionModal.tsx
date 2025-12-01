/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/imageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'
import {SellType, InventoryType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from "phosphor-react-native"
import React, { useEffect, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

const TransactionModal = () => {
    const {user} = useAuth("");
    const [transaction, setTransaction] = useState<SellType>({
        type: "expense",
        Price: 0,
        description: "",
        category: "",
        date: new Date(),
        walletId: "",
        image: null,
    });
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
      data: wallets,
      error: walletError,
      loading: walletLoading}=
      useFetchData<WalletType>("wallets", [
      where("uid", "==",user?.uid),
      orderBy("created", "desc")
    ]);
    type paramType = {
      id: string,
      type: string,
      amount: string,
      category?: string,
      date: string,
      description: string,
      image?: any,
      uid?: string,
      walletId: string,
    }
    const oldTransaction : paramType= useLocalSearchParams();

    const onDateChange = (event: any, selectedDate: any) => {
      const currentDate = selectedDate || transaction.date;
      setTransaction({...transaction, date: currentDate})
      {
        Platform.OS == "android" && (setShowDatePicker(false)) 
      }
    };

    useEffect(()=>{
            if(oldTransaction?.id){
                setTransaction({
                  type: oldTransaction?.type,
                  amount: Number(oldTransaction.amount),
                  description: oldTransaction.description || "",
                  category: oldTransaction.category || "",
                  date: new Date(oldTransaction.date),
                  walletId: oldTransaction.walletId,
                  image: oldTransaction?.image,
                })
            }
          },[])

    const onSubmit = async ()=>{
      const {type, amount, description, category,date,walletId,image} = transaction;
      if(!walletId || !date || (type == "expense" && !category)){
        Alert.alert("Transaction", "Please fill all the fields");
        return;
      }
      let transactionData: TransactionType = {
        type,
        amount,
        description,
        category,
        date,
        walletId,
        image : image? image: null,
        uid: user?.uid
      }
      if(oldTransaction?.id) transactionData.id =oldTransaction.id;
      setLoading(true);
      const res = await createOrUpdateTransaction(transactionData);
      setLoading(false);
      if(res.success){
        router.back();
      }else{
        Alert.alert("Transaction", res.msg)
      }
    };
    const onDelete = async ()=>{
        if(!oldTransaction?.id) return;
        setLoading(true);
        const res = await deleteTransaction(oldTransaction?.id , oldTransaction?.walletId);
        setLoading(false);
        if(res.success){
            router.back();
        }else{
            Alert.alert("Transaction: ", res.msg);
        }
    }
    const showDeleteAlert = ()=>{
        Alert.alert("Confirm", "Are you sure you want to delete this transation? ",
        [
            {
                text: "Cancel",
                onPress: ()=> console.log("Cancel Delete"),
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: ()=> onDelete(),
                style: "destructive"
            }
        ])
    }
    

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title={oldTransaction?.id ? "Update Transaction": "New Transaction"} leftIcon={<BackButton/>} style={{marginBottom: spacingY._10}}/>
        {/*===================== form================= */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                      {/* Transaction Drop Down */}
            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Transaction Type</Typo>
                {/* dropdown here */}
                  <Dropdown
                      style={styles.dropDownContainer}
                      activeColor={colors.neutral700}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      iconStyle={styles.dropdownIcon}
                      data={transactionTypes}
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      itemTextStyle={styles.dropdownItemText}
                      itemContainerStyle={styles.dropdownItemContainer}
                      containerStyle= {styles.dropdwnListContainer}
                      value={transaction.type}
                      onChange={item => {
                        setTransaction({...transaction, type: item.value})
                      }}
                    />
            </View> 
          {/* Wallets Drop Down */}
            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Wallets</Typo>
                {/* dropdown here */}
                        <Dropdown
                            style={styles.dropDownContainer}
                            activeColor={colors.neutral700}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            // inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.dropdownIcon}
                            data={wallets.map(wallet =>({
                              label: `${wallet.name} ($${wallet.amount})`,
                              value: wallet?.id,
                            }))}
                            // search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            containerStyle= {styles.dropdwnListContainer}
                            placeholder={'Select wallet'}
                            value={transaction.walletId}
                            onChange={item => {
                              setTransaction({...transaction, walletId: item.value || ""})
                            }}
                          />
            </View>
            {/* expense category Drop Down */}
            {
              transaction.type == "expense" && (
                <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Expense category</Typo>
                {/* dropdown here */}
                        <Dropdown
                            style={styles.dropDownContainer}
                            activeColor={colors.neutral700}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={Object.values(expenseCategories)}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            containerStyle= {styles.dropdwnListContainer}
                            placeholder={'Select category'}
                            value={transaction.category}
                            onChange={item => {
                              setTransaction({...transaction, category: item.value || ""})
                            }}
                          />
            </View>
              )
            }

            {/* date Picker */}
            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Date</Typo>
                {
                  !showDatePicker && (
                    <Pressable style={styles.dateInput} onPress={()=> setShowDatePicker(true)}>
                      <Typo size={14}>
                        {(transaction.date as Date).toLocaleDateString()}
                      </Typo>
                    </Pressable>
                  )}
                  {
                    showDatePicker && (
                      <View style={Platform.OS == "ios" && styles.iosDataPicker}>
                        <DateTimePicker themeVariant="dark" value={transaction.date as Date} textColor={colors.white} mode="date" display="spinner" onChange={onDateChange}/>
                        {
                          Platform.OS == 'ios' && (
                            <TouchableOpacity style={styles.dataPickerButtton} onPress={()=> setShowDatePicker(false) }>
                              <Typo size={15} fontWeight={"500"}>Ok</Typo>
                            </TouchableOpacity>
                          )
                        }
                      </View>
                    )
                  }
            </View>
            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Amount</Typo>
                <Input keyboardType='numeric' value={transaction.amount?.toString()} onChangeText={(value)=> setTransaction({...transaction, amount: Number(value.replace(/[^0-9]/g,""))})}/>
            </View>
            <View style={styles.inputContainer}>
                <View style={styles.flexRow} >
                  <Typo color={colors.neutral200} size={16}>Description</Typo>
                  <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                </View>
                <Input value={transaction.description} multiline containerStyle={{
                  flexDirection: "row",
                  height: verticalScale(100),
                  alignItems: "flex-start",
                  paddingVertical: 15,
                }} 
                onChangeText={(value)=> setTransaction({...transaction, description: value})}
                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.flexRow} >
                  <Typo color={colors.neutral200} size={16}>Receipt</Typo>
                  <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                </View>
                {/* Image input */}
                <ImageUpload file={transaction.image} onClear={()=> setTransaction({...transaction, image: null})} onSelect={file => setTransaction({...transaction, image: file})} placeholder='Upload Image' />
            </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        {
            oldTransaction?.id&& !loading && (
                <Button style={{
                    backgroundColor: colors.rose,
                    paddingHorizontal: spacingX._15
                }} onPress={showDeleteAlert}>
                    <Icons.Trash color={colors.white} size={verticalScale(24)} weight="bold" />
                </Button>
            )
        }
        <Button onPress={onSubmit} loading={loading} style={{flex: 1}}>
            <Typo color={colors.black} fontWeight={"700"} >
                {
                    oldTransaction?.id ? "Update" : "Submit"
                }
            </Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: spacingY._20,
    },
    form: {
      gap: spacingY._20,
      paddingVertical: spacingY._15,
      paddingBottom: spacingY._40,
    },
    flexRow:{
      flexDirection:"row",
      alignItems: "center",
      gap: spacingX._5,
    },
    footer:{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1,
    },
    dateInput: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: "flex-start",
      height: verticalScale(54),
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.neutral300,
      borderRadius: radius._17,
      borderCurve: "continuous",
      paddingHorizontal: spacingX._15,
    },
    inputContainer: {
        gap: spacingY._10,
    },
    iosDropDown:{
      flexDirection: "row",
      height: verticalScale(54),
      alignItems: "center",
      justifyContent: "center",
      fontSize: verticalScale(14),
      borderWidth: 1,
      color: colors.white,
      borderColor: colors.neutral300,
      borderRadius: radius._17,
      borderCurve: "continuous",
      paddingHorizontal: spacingX._15,
    },
    androidDropDown:{
      // flexDirection: "row",
      height: verticalScale(54),
      alignItems: "center",
      justifyContent: "center",
      fontSize: verticalScale(14),
      borderWidth: 1,
      color: colors.white,
      borderColor: colors.neutral300,
      borderRadius: radius._17,
      borderCurve: "continuous",
      // paddingHorizontal: spacingX._15,
    },
    iosDataPicker: {
      backgroundColor: "red",
    },
    dataPickerButtton: {
      backgroundColor: colors.neutral700,
      alignSelf: "flex-end",
      padding: spacingY._7,
      marginRight: spacingX._7,
      paddingHorizontal: spacingY._15,
      borderRadius: radius._10,
    },
    dropdwnListContainer: {
      backgroundColor: colors.neutral900,
      borderRadius: radius._15,
      borderCurve: "continuous",
      paddingVertical: spacingY._7,
      top: 5,
      borderColor: colors.neutral500,
      shadowColor: colors.black,
      shadowOffset: {width: 0,height:5},
      shadowOpacity: 1,
      shadowRadius: 15,
      elevation: 5
    },
    dropDownContainer: {
      height: verticalScale(54),
      borderWidth: 1,
      borderColor: colors.neutral300,
      paddingHorizontal: spacingX._15,
      borderRadius: radius._15,
      borderCurve: "continuous",
    },
    dropdownItemText: {
      color: colors.white,
    },
    dropdownSelectedText: {
      color: colors.white,
      fontSize: verticalScale(14),
    },
    dropdownPlaceholder: {
      color: colors.white,
    },
    dropdownItemContainer: {
      borderRadius: radius._15
    },
    dropdownIcon: {
      height: verticalScale(30),
      tintColor: colors.neutral300
    }
})