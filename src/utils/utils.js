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

export const calculateColumns = (galleryColumnName, currentColumns) =>  {
  let newColumns = [];
  galleryColumnName.forEach(columnName => {
    let column = currentColumns.find(column => columnName === column.name);
    if (column) {
      newColumns.push(column);
    } 
  });
  return newColumns;
};

export const calculateColumnsName = (currentColumns, galleryColumnsName) => {
  let newColumnsName = [];
  currentColumns.forEach(column => {
    newColumnsName.push(column.name);
  });
  if (galleryColumnsName) {
    newColumnsName = Array.from(new Set([...galleryColumnsName, ...newColumnsName]));
    newColumnsName = newColumnsName.filter(columnName => newColumnsName.some(c => c === columnName));
  }
  return newColumnsName;
}