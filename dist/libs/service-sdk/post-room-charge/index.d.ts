import { IPostRoomChargeInput } from "./pms";
declare enum PostRoomChargeType {
    PMS = "PMS"
}
declare const getPostRoomChargeService: (type: PostRoomChargeType) => {
    post: (data: IPostRoomChargeInput) => Promise<void>;
};
export { getPostRoomChargeService, PostRoomChargeType, IPostRoomChargeInput };
