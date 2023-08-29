// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {IORMerkleTree} from "./interface/IORMerkleTree.sol";

abstract contract MerkleTreeVerification is IORMerkleTree {
    // function verify(
    //     bytes32 key,
    //     bytes32 v,
    //     bytes32 leaves_bitmap,
    //     bytes32 root,
    //     MergeValue[] calldata siblings
    // ) public override returns (bool) {
    //     // 定义初始路径
    //     bytes32 current_path = key;
    //     uint256 n = 0;
    //     // 初始化节点的MergeValue
    //     MergeValue memory current_v;
    //     current_v.shortCut = ShortCut({key: key, value: v, height: 0});
    //     // 定义左右节点的MergeValue
    //     MergeValue memory left;
    //     MergeValue memory right;
    //     // 循环遍历0到255（包括255）
    //     for (uint8 i = 0; i < 256; i++) {
    //         // 根据当前节点的路径得到父节点的路径
    //         bytes32 parent_path = current_path.parent_path(i);
    //         // 如果有兄弟节点（两个节点都是非零)
    //         if (leaves_bitmap.get_bit(i)) {
    //             if (current_path.is_right(i)) {
    //                 left = siblings[n];
    //                 right = current_v;
    //             } else {
    //                 left = current_v;
    //                 right = siblings[n];
    //             }
    //             n += 1;
    //         }
    //         // 如果没有兄弟节点（遇到零的兄弟节点）
    //         else {
    //             if (current_path.is_right(i)) {
    //                 left = MergeValue.zero();
    //                 right = current_v;
    //             } else {
    //                 left = current_v;
    //                 right = MergeValue.zero();
    //             }
    //         }
    //         // 计算父节点的MergeValue  （高度， 父节点路径， 左节点， 右节点）
    //         current_v = (i, parent_path, left, right);
    //         // 把父节点设置为当前节点
    //         current_path = parent_path;
    //     }
    //     // 循环结束 获得新的root
    //     bytes32 new_root = current_v.hash();
    //     return new_root == root;
    // }
}
