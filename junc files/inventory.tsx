import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Button, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { InventoryType } from '../../types';
import { collection, onSnapshot, doc, deleteDoc, getFirestore, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import {app} from '../../config/firebase.client';
import {uploadFileToCloudinary} from '../../services/imageServices';
import * as ImagePicker from 'expo-image-picker';

const db = getFirestore(app);

const InventoryScreen = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'expireDate' | 'created' | 'updated' | 'name'>('expireDate');
  const [products, setProducts] = useState<InventoryType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<InventoryType>({ name: '', price: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as InventoryType),
        id: docSnap.id,
      }));
      setProducts(data);
    });
    return () => unsub();
  }, []);

  const filteredAndSorted = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const aDate = new Date(a[sortBy] || '');
      const bDate = new Date(b[sortBy] || '');
      return aDate.getTime() - bDate.getTime();
    });

  const totalPositiveQtyPrice = products
  .filter((p) => (p.quantity ?? 0) > 0)
  .reduce((sum, p) => sum + p.price, 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
      Alert.alert('Deleted', 'Product deleted successfully');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    let imageUrl = form.image || null;
    if (imageUrl && !imageUrl.startsWith('http')) {
      const uploadRes = await uploadFileToCloudinary(imageUrl, 'products');
      if (!uploadRes.success) return Alert.alert('Image Upload Error', uploadRes.msg || 'Upload failed');
      imageUrl = uploadRes.data;
    }

    const productToSave: InventoryType = {
      ...form,
      image: imageUrl,
      created: selectedProduct?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
      expireDate: form.expireDate ? new Date(form.expireDate).toISOString() : '',
    };

    try {
      if (selectedProduct?.id) {
        await updateDoc(doc(db, 'inventory', selectedProduct.id), productToSave);
        Alert.alert('Updated', 'Product updated successfully');
      } else {
        await addDoc(collection(db, 'inventory'), productToSave);
        Alert.alert('Added', 'Product added successfully');
      }
      setModalVisible(false);
      setForm({ name: '', price: 0 });
      setSelectedProduct(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setForm(selectedProduct);
    } else {
      setForm({ name: '', price: 0 });
    }
  }, [selectedProduct]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total price</Text>
          <Text style={styles.summaryValue}>${totalPositiveQtyPrice}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Total Products</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
      </View>

      <View style={styles.searchSortContainer}>
        <TextInput
          placeholder="Search by name"
          placeholderTextColor="#000"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortBy}
            style={styles.sortPicker}
            onValueChange={(itemValue) => setSortBy(itemValue)}>
            <Picker.Item label="Expire Date" value="expireDate" />
            <Picker.Item label="Created Date" value="created" />
            <Picker.Item label="Updated Date" value="updated" />
            <Picker.Item label="Name" value="name" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={filteredAndSorted}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
              setSelectedProduct(item);
              setModalVisible(true);
            }}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDetail}>Price: ${item.price}</Text>
            <Text style={styles.productDetail}>Qty: {item.quantity}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedProduct(null);
          setModalVisible(true);
        }}>
        <Text style={styles.addText}>+ Add Product</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={[styles.container]}> 
          <Text style={[styles.productName, { textAlign: 'center', marginBottom: 16 }]}>Product Form</Text>

          <TextInput placeholder="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} />
          <TextInput placeholder="Brand" value={form.brand} onChangeText={(v) => setForm({ ...form, brand: v })} style={styles.input} />
          <TextInput placeholder="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} style={styles.input} />
          <TextInput placeholder="Price" keyboardType="numeric" value={form.price.toString()} onChangeText={(v) => setForm({ ...form, price: parseFloat(v) })} style={styles.input} />
          <TextInput placeholder="Quantity" keyboardType="numeric" value={form.quantity?.toString() || ''} onChangeText={(v) => setForm({ ...form, quantity: parseInt(v) })} style={styles.input} />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
            <Text style={{ color: '#000' }}>{form.expireDate ? new Date(form.expireDate).toDateString() : 'Select Expire Date'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={form.expireDate ? new Date(form.expireDate) : new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setForm({ ...form, expireDate: date.toISOString() });
              }}
            />
          )}

          <Button title="Pick Image" onPress={handlePickImage} />
          {form.image && <Text style={{ color: '#fff', marginVertical: 8 }}>Image selected</Text>}

          {selectedProduct?.id && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(selectedProduct.id!)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>{selectedProduct ? 'Update' : 'Add'} Product</Text>
          </TouchableOpacity>

          <Button title="Close" onPress={() => setModalVisible(false)} />
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#262626', padding: 12 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  summaryText: { fontSize: 12, color: '#000' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  searchSortContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, marginRight: 8, height: 40, color: '#000' },
  pickerWrapper: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  sortPicker: { height: 40, width: 140, color: '#000' },
  productCard: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginBottom: 8 },
  productName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  productDetail: { color: '#ccc', fontSize: 14 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40, marginBottom: 10, color: '#000' },
  dateInput: { backgroundColor: '#d4d4d4', borderRadius: 8, padding: 12, marginBottom: 10 },
  deleteButton: { backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  deleteText: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#a3e635', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  saveText: { color: '#000', fontWeight: 'bold' },
  addButton: { backgroundColor: '#a3e635', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 16 },
  addText: { color: '#000', fontWeight: 'bold' },
});

export default InventoryScreen;