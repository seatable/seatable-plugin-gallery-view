export const generatorBase64Code = (keyLength = 4) => {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < keyLength; i++) {
    key += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return key;
};

export const generatorViewId = (views) => {
  let view_id, isUnique = false;
  while (!isUnique) {
    view_id = generatorBase64Code(4);

    // eslint-disable-next-line
    isUnique = views.every(item => {return item._id !== view_id;});
    if (isUnique) {
      break;
    }
  }
  return view_id;
};

export const getImageThumbnailUrl = (url) => {
  let { server } = window.dtable;
  let isInternalLink = url.indexOf(server) > -1;
  if (isInternalLink) {
    let imageThumbnailUrl = url.replace('/workspace', '/thumbnail/workspace') + '?size=256';
    return imageThumbnailUrl;
  }
  return url;
};

export const isValidEmail = (email) => {
  const reg = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,6}$/;

  return reg.test(email);
};

export const calculateColumns = (galleryColumnName, currentColumnName, currentColumns) =>  {
  let newColumnsMap = new Set([...galleryColumnName, ...currentColumnName]);
  let newColumns = [];
  newColumnsMap.forEach(columnName => {
    let column = currentColumns.find(column => columnName === column.name);
    if (column) {
      newColumns.push(column);
    } 
  })
  return newColumns;
};

export const calculateCurrentColumnsName = (currentColumns) => {
  let nameColumnsMap = [];
  currentColumns.forEach(column => {
    nameColumnsMap.push(column.name);
  })
  return nameColumnsMap;
}

export const calculateColumnsName = (galleryColumnsMap, currentColumnsMap) => {
  let newColumnsMap = Array.from(new Set([...galleryColumnsMap, ...currentColumnsMap]));
  newColumnsMap = newColumnsMap.filter(columnName => currentColumnsMap.some(c => c === columnName));
  return newColumnsMap;
}