module.exports = formatDate = (date) => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
  
    return new Date(date).toLocaleString('es-ES', options).replace(",", "");
  }