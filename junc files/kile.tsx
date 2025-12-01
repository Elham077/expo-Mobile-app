import React from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ProductForm } from '../components/ProductForm';
import { InventoryType } from '../types/inventory';
import { addProduct, updateProduct } from '../services/inventory';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialValues?: InventoryType;
  onSuccess?: () => void;
};

export const AddProductModal: React.FC<Props> = ({
  visible,
  onClose,
  initialValues,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (
    data: Omit<InventoryType, 'id' | 'created' | 'updated'>,
    imageUri?: string
  ) => {
    try {
      setLoading(true);
      if (initialValues?.id) {
        await updateProduct(initialValues.id, data, imageUri);
      } else {
        await addProduct(data, imageUri);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Product save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {initialValues?.id ? 'Update Product' : 'Add Product'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <ProductForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});