import { Dispatch, SetStateAction, useEffect } from 'react';
import { keyValueType, usePosts } from '../../hooks/usePosts';

import Item from './Item';
import { ItemType } from '../KakaoMapContainer/itemType';
import { ItemFilterProps } from '../ItemFilter';

import * as S from './styles';
import SkeletonItemList from '../Skeleton/SkeletonItemList';

interface ItemListProps {
  pageItems: ItemType[];
  setPageItems: Dispatch<SetStateAction<ItemType[]>>;
  category: string;
  condition: ItemFilterProps;
  keyword: string;
  currentPage: number;
  mapBoundsInfo?: kakao.maps.LatLngBounds;
}

const ItemList = ({
  pageItems,
  setPageItems,
  category,
  condition,
  keyword,
  currentPage,
  mapBoundsInfo,
}: ItemListProps) => {
  // Data Fetch - 현재 페이지의 데이터 (Page + Lat/Lng 필수)
  const queryParameters: keyValueType = {
    page: currentPage,
    swLatitude: mapBoundsInfo && mapBoundsInfo.getSouthWest().getLat(),
    swLongitude: mapBoundsInfo && mapBoundsInfo.getSouthWest().getLng(),
    neLatitude: mapBoundsInfo && mapBoundsInfo.getNorthEast().getLat(),
    neLongitude: mapBoundsInfo && mapBoundsInfo.getNorthEast().getLng(),
    mainCategory: condition.petType,
    subCategory: category,
    status: condition.status,
    keyword: keyword,
  };

  const { isLoading, data } = usePosts(queryParameters);

  useEffect(() => {
    if (!isLoading && data !== null) {
      setPageItems(data);  
    }
  }, [isLoading]);

  const itemList = pageItems && pageItems.map((item) => {
    return <Item itemInfo={item} key={item.id} />;
  });

  return <S.Container>{isLoading ? <SkeletonItemList /> : itemList}</S.Container>;
};

export default ItemList;
