export default interface BestPrice {
  type: 'pool' | 'exchange';
  address: string;
  value: string;
}
