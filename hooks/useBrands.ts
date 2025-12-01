import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase.client';
import { BrandType } from '@/types';

export const useBrands = (category?: string) => {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'brands'), orderBy('name'));
        
        if (category) {
          q = query(q, where('category', '==', category));
        }

        const querySnapshot = await getDocs(q);
        const brandsData: BrandType[] = [];
        
        querySnapshot.forEach((doc) => {
          brandsData.push({ id: doc.id, ...doc.data() } as BrandType);
        });

        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [category]);

  return { brands, loading };
};