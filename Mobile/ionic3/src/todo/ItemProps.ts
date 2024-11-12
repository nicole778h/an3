export interface ItemProps {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  date: Date;
  closed: boolean;
  photo?: string | null;
  location: { lat: number; lng: number };
}