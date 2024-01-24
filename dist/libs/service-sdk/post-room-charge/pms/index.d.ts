export interface IPostRoomChargeInput {
    room_number: string;
    oms_hotel_id: number;
    amount: number;
    order_id: number;
    status: string;
}
export declare const PMSProvider: () => {
    post: (data: IPostRoomChargeInput) => Promise<void>;
};
