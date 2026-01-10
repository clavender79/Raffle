
const CryptoIcon = ({ type, className = '', width = 70, height = 70, style = {} }) => {
    let src = '';
    switch (type) {
        case 'eth':
            src = '/ethereumCoin.svg';
            break;
        case 'btc':
            src = '/bitcoinCoin.svg';
            break;
        case 'ethLogo':
            src = '/ethereumLogo.png';
            break;
        case 'ethActual':
            src='/ethActualLogo.svg';
            break;
        default:
            src = '/coin.png';
    }

    return (
        <img
            src={src}
            alt={`${type} icon`}
            width={width}
            height={height}
            className={`object-contain ${className}`}
            style={style}
        />
    );
};

export default CryptoIcon;