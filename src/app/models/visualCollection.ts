/**
 * Created by lenniestockman on 18/01/18.
 */
export class visualCollection{
  numberOfUsers: number;
  totalAmount: number;

  constructor(numberOfusers = 0, totalAmount = 0) {
    this.numberOfUsers = numberOfusers;
    this.totalAmount = totalAmount;
  }
}
