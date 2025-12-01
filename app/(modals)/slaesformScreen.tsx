// app/sellForm.tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAllSales } from "@/services/sellServices";
import { SellType } from "@/types";
import SellForm from "./addSaleMOdal"; // مسیر واقعی محل قرارگیری SellForm شما

const SellFormScreen = () => {
  const { id } = useLocalSearchParams();
  const [saleToEdit, setSaleToEdit] = useState<SellType | undefined>(undefined);

  useEffect(() => {
    if (id) {
      getAllSales().then((sales) => {
        const sale = sales.find((s) => s.id === id);
        if (sale) setSaleToEdit(sale);
      });
    }
  }, [id]);

  return <SellForm saleToEdit={saleToEdit} />;
};

export default SellFormScreen;
