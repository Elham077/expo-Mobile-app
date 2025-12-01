import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Image, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver,SubmitHandler } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { InventoryType } from '../../types';
import Input from '@/components/Input';

type Props = {
  initialValues?: Partial<InventoryType>;
  onSubmit: (values: Omit<InventoryType, 'id' | 'created' | 'updated'>, imageUri?: string) => void;
  onCancel?: () => void;
};

const schema = yup.object({
  name: yup.string().required('Name is required'),
  price: yup.number().typeError('Price must be a number').required('Price is required').min(0),
  description: yup.string().nullable().optional().default(undefined),
  brand: yup.string().nullable().optional().default(undefined),
  quantity: yup.number().typeError('Quantity must be a number').nullable().optional().default(undefined).min(0),
  expireDate: yup.string().nullable().optional().default(undefined),
});

export const ProductForm: React.FC<Props> = ({ initialValues = {}, onSubmit, onCancel }) => {
  const [imageUri, setImageUri] = useState<string | null>(initialValues.image ?? null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<InventoryType, 'id' | 'created' | 'updated'>>({
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      brand: '',
      quantity: undefined,
      expireDate: '',
      ...initialValues,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    reset(initialValues);
    setImageUri(initialValues.image ?? null);
  }, [initialValues]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };


  const onFormSubmit: SubmitHandler<Omit<InventoryType, 'id' | 'created' | 'updated'>> = (data) => {
    onSubmit(data, imageUri ?? undefined);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Name*</Text>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Product Name" {...field} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Text>Price*</Text>
      <Controller
        control={control}
        name="price"
        render={({ field }) => (
          <Input
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            {...field}
            value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.price && <Text style={styles.error}>{errors.price.message}</Text>}

      <Text>Brand</Text>
      <Controller
        control={control}
        name="brand"
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Brand" {...field} />
        )}
      />

      <Text>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Description" multiline {...field} />
        )}
      />

      <Text>Quantity</Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field }) => (
          <Input style={styles.input} placeholder="Quantity" keyboardType="numeric" {...field} />
        )}
      />

      <Text>Expire Date (yyyy-mm-dd)</Text>
      <Controller
        control={control}
        name="expireDate"
        render={({ field }) => (
          <Input style={styles.input} placeholder="2025-12-31" {...field} />
        )}
      />

      <TouchableOpacity onPress={pickImage} style={{ marginVertical: 8 }}>
        <Text style={{ color: 'blue' }}>{imageUri ? 'Change Image' : 'Pick Image'}</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />}

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button title="Save" onPress={handleSubmit(onFormSubmit)} />
        {onCancel && (
          <View style={{ marginLeft: 8 }}>
            <Button title="Cancel" color="gray" onPress={onCancel} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
};
