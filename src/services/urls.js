const isProduction = process.env.NODE_ENV === 'production';

const ROOT_URL = isProduction ? 'https://rmsapi.idt.one' : 'http://10.220.22.186:8226';

export default ROOT_URL;
