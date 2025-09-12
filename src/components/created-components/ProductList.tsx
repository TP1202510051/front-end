import React from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/models/productModel";

interface Props {
  products: Product[];
  onSelect: (p: Product) => void;
}

export const ProductList: React.FC<Props> = ({ products, onSelect }) => (
  <>
    {products.map((product) => (
      <div key={product.id} className="rounded flex flex-col pt-2 gap-2">
        <Button
          className="transition-colors cursor-pointer text-left justify-start bg-transparent hover:bg-[#343540] text-white hover:font-semibold"
          onClick={() => onSelect(product)}
        >
          {product.name}
        </Button>
      </div>
    ))}
  </>
);
