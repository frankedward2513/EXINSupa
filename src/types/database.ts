export interface Supplier {
  sup_ID: number;
  sup_Company: string;
  sup_Name: string;
  sup_Email: string;
  sup_Address: string;
  sup_Description: string;
  created_at: string;
}

export interface Category {
  cat_ID: number;
  cat_Name: string;
  cat_Description: string;
  cat_Color: string;
  created_at: string;
}

export interface Bale {
  bal_ID: number;
  bal_Name: string;
  bal_Code: string;
  cat_ID: number;
  sup_ID: number;
  bal_TotalPurchase: number;
  bal_Quantity: number;
  bal_PricePerPiece: number;
  bal_Status: string;
  bal_Description: string;
  created_at: string;
}

export interface Product {
  pro_ID: number;
  pro_Name: string;
  cat_ID: number;
  bal_ID: number;
  pro_Quantity: number;
  pro_SellingPrice: number;
  pro_Size: string;
  pro_Link: string;
  pro_Image: string;
  pro_Description: string;
  created_at: string;
}

export interface Account {
  acc_ID: number;
  acc_Name: string;
  acc_Budget: number;
  acc_Color: string;
  acc_Description: string;
  created_at: string;
}

export interface Expense {
  exp_ID: number;
  acc_ID: number;
  exp_Amount: number;
  exp_Date: string;
  exp_PaymentMethod: string;
  exp_Receipt: string;
  exp_Description: string;
  created_at: string;
}