import {
  types,
  getEnv,
  detach,
  setLivelynessChecking,
  isAlive,
  Instance
} from 'mobx-state-tree';
import {iRendererStore, IIRendererStore, SIRendererStore} from './iRenderer';
import {ServiceStore} from './service';
import {ComboStore} from './combo';
import {FormStore} from './form';
import {CRUDStore} from './crud';
import {TableStore} from './table';
import {ListStore} from './list';
import {ModalStore} from './modal';
import {TranslateFn} from '../locale';
import find from 'lodash/find';
import {IStoreNode} from './node';
import {FormItemStore} from './formItem';
import {addStore, getStoreById, getStores, removeStore} from './manager';
import {PaginationStore} from './pagination';
import {AppStore} from './app';
import {RootStore} from './root';

setLivelynessChecking(
  process.env.NODE_ENV === 'production' ? 'ignore' : 'error'
);

// 能创建单独新的数据域的容器组件，除了最顶层的 Page，还有 CRUD、Dialog、IFrame、Form、Service 等
// 可以理解成必须在容器组件内部，才能使用数据，才能使用变量 ${text} 模板语法
// 参考：https://baidu.gitee.io/amis/zh-CN/docs/concepts/datascope-and-datachain#%E5%B8%B8%E8%A7%81%E8%AF%AF%E8%A7%A3
const allowedStoreList = [
  ServiceStore,
  FormStore,
  ComboStore,
  CRUDStore,
  TableStore,
  ListStore,
  ModalStore,
  FormItemStore,
  PaginationStore,
  AppStore
];

export const RendererStore = types
  .model('RendererStore', {
    storeType: 'RendererStore'
  })
  .views(self => ({
    get fetcher() {
      return getEnv(self).fetcher;
    },

    get notify() {
      return getEnv(self).notify;
    },

    get isCancel(): (value: any) => boolean {
      return getEnv(self).isCancel;
    },

    get __(): TranslateFn {
      return getEnv(self).translate;
    },
    getStoreById(id: string) {
      return getStoreById(id);
    },

    get stores() {
      return getStores();
    }
  }))
  .actions(self => ({
    // 添加store
    addStore(store: {
      storeType: string;
      id: string;
      path: string;
      parentId?: string;
      [propName: string]: any;
    }): IStoreNode {
      // 根节点
      if (store.storeType === RootStore.name) {
        return addStore(RootStore.create(store, getEnv(self)));
      }

      // 根据 storeType 找到要添加的store
      const factory = find(
        allowedStoreList,
        item => item.name === store.storeType
      )!;

      // 
      return addStore(factory.create(store as any, getEnv(self)));
    },

    removeStore(store: IStoreNode) {
      // store.dispose();
      removeStore(store);
    }
  }));

export type IRendererStore = Instance<typeof RendererStore>;
export {iRendererStore, IIRendererStore};
export const RegisterStore = function (store: any) {
  allowedStoreList.push(store as any);
};
