const coordinateLimits = {
  latitude: 90,
  longitude: 180,
};

const axisHemispheres = {
  latitude: ['N', 'S'],
  longitude: ['E', 'W', 'O'],
};

const hemisphereFor = (value, axis) => {
  if (axis === 'latitude') return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
};

const getComponents = (value, precision) => {
  const scale = 10 ** precision;
  const totalMinutes = Math.round(Math.abs(value) * 60 * scale) / scale;
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = Number((totalMinutes - degrees * 60).toFixed(precision));
  return { degrees, minutes };
};

const formatDegreesDecimalMinutes = (value, axis, includeMinuteMark = true) => {
  const { degrees, minutes } = getComponents(value, 3);
  const minuteMark = includeMinuteMark ? "'" : '';
  return `${degrees}° ${minutes.toFixed(3)}${minuteMark} ${hemisphereFor(value, axis)}`;
};

const formatDegreesMinutesSeconds = (value, axis) => {
  const totalSeconds = Math.round(Math.abs(value) * 3600 * 1000) / 1000;
  const degrees = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds - degrees * 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = Number((remainingSeconds - minutes * 60).toFixed(3));

  return `${degrees}° ${minutes}' ${seconds.toFixed(3)}" ${hemisphereFor(value, axis)}`;
};

const formatNmea = (value, axis) => {
  const { degrees, minutes } = getComponents(value, 4);
  const degreeDigits = axis === 'latitude' ? 2 : 3;
  const minuteValue = minutes.toFixed(4).padStart(7, '0');
  return `${String(degrees).padStart(degreeDigits, '0')}${minuteValue} ${hemisphereFor(value, axis)}`;
};

export const parseCoordinate = (input, axis) => {
  const maximum = coordinateLimits[axis];
  if (maximum === undefined) throw new Error('Tipo de coordenada no válido.');
  if (!String(input).trim()) throw new Error('Completá ambas coordenadas.');

  const text = String(input)
    .trim()
    .toUpperCase()
    .replace(/\bNORTE\b/g, ' N ')
    .replace(/\bSUR\b/g, ' S ')
    .replace(/\bESTE\b/g, ' E ')
    .replace(/\bOESTE\b/g, ' O ');
  const hemispheres = text.match(/[NSEWO]/g) || [];
  if (hemispheres.length > 1) throw new Error('Usá un solo punto cardinal por coordenada.');

  const hemisphere = hemispheres[0] || '';
  if (hemisphere && !axisHemispheres[axis].includes(hemisphere)) {
    throw new Error(axis === 'latitude'
      ? 'La latitud debe indicar N o S, no E u O.'
      : 'La longitud debe indicar E, W u O, no N ni S.');
  }

  const normalized = text
    .replace(/[NSEWO]/g, ' ')
    .replace(/\b(?:DEGREES?|DEG|MINUTES?|MINS?|MIN|SECONDS?|SECS?|SEC)\b/g, ' ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[°º′'’″"]/g, ' ')
    .replace(/:/g, ' ')
    .trim();

  if (!/^[+-]?\d+(?:\.\d+)?(?:[\s,]+[+-]?\d+(?:\.\d+)?){0,2}$/.test(normalized)) {
    throw new Error('Formato no reconocido. Ingresá grados decimales, grados/minutos o grados/minutos/segundos.');
  }

  const parts = normalized.split(/[\s,]+/).map(Number);
  const [degreesInput, minutes = 0, seconds = 0] = parts;
  const degrees = Math.abs(degreesInput);

  if (parts.length > 1 && !Number.isInteger(degrees)) {
    throw new Error('Cuando ingresás minutos o segundos, los grados deben ser enteros.');
  }
  if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error('Los minutos y segundos deben ser mayores o iguales a 0 y menores que 60.');
  }
  if (degrees > maximum || (degrees === maximum && (minutes !== 0 || seconds !== 0))) {
    throw new Error(`La coordenada excede el máximo permitido de ${maximum}°.`);
  }

  const magnitude = degrees + minutes / 60 + seconds / 3600;
  const hemisphereSign = hemisphere === 'S' || hemisphere === 'W' || hemisphere === 'O' ? -1 : 1;
  if (degreesInput < 0 && hemisphere && hemisphereSign > 0) {
    throw new Error('El signo negativo no coincide con el punto cardinal indicado.');
  }

  const sign = hemisphere ? hemisphereSign : (degreesInput < 0 ? -1 : 1);
  return sign * magnitude;
};

export const convertCoordinates = (latitudeInput, longitudeInput) => {
  const latitude = parseCoordinate(latitudeInput, 'latitude');
  const longitude = parseCoordinate(longitudeInput, 'longitude');

  return {
    latitude,
    longitude,
    formats: [
      {
        id: 'mtu',
        label: 'MTU AIS-C',
        description: 'Grados, minutos y segundos',
        latitude: formatDegreesMinutesSeconds(latitude, 'latitude'),
        longitude: formatDegreesMinutesSeconds(longitude, 'longitude'),
      },
      {
        id: 'kanaton',
        label: 'Kanaton',
        description: 'Grados y minutos decimales',
        latitude: formatDegreesDecimalMinutes(latitude, 'latitude', false),
        longitude: formatDegreesDecimalMinutes(longitude, 'longitude', false),
      },
      {
        id: 'decimal',
        label: 'Grados decimales (DD)',
        description: 'Coordenadas con signo, sin punto cardinal',
        latitude: `${latitude.toFixed(8)}°`,
        longitude: `${longitude.toFixed(8)}°`,
      },
      {
        id: 'decimal-hemisphere',
        label: 'Grados decimales con punto cardinal',
        description: 'Valor positivo con N/S o E/O',
        latitude: `${Math.abs(latitude).toFixed(8)}° ${hemisphereFor(latitude, 'latitude')}`,
        longitude: `${Math.abs(longitude).toFixed(8)}° ${hemisphereFor(longitude, 'longitude')}`,
      },
      {
        id: 'ddm',
        label: 'Formato DDM estándar',
        description: 'Grados y minutos decimales con símbolo de minutos',
        latitude: formatDegreesDecimalMinutes(latitude, 'latitude'),
        longitude: formatDegreesDecimalMinutes(longitude, 'longitude'),
      },
      {
        id: 'nmea',
        label: 'NMEA 0183',
        description: 'DDMM.mmmm para latitud · DDDMM.mmmm para longitud',
        latitude: formatNmea(latitude, 'latitude'),
        longitude: formatNmea(longitude, 'longitude'),
      },
    ],
  };
};

export const createOpenStreetMapEmbedUrl = (latitude, longitude) => {
  const latitudeRadius = 0.025;
  const longitudeRadius = Math.min(
    0.12,
    latitudeRadius / Math.max(Math.cos((latitude * Math.PI) / 180), 0.2) * 1.6
  );
  const bounds = [
    Math.max(-180, longitude - longitudeRadius),
    Math.max(-90, latitude - latitudeRadius),
    Math.min(180, longitude + longitudeRadius),
    Math.min(90, latitude + latitudeRadius),
  ].map((value) => value.toFixed(6));
  const parameters = new URLSearchParams({
    bbox: bounds.join(','),
    layer: 'mapnik',
    marker: `${latitude.toFixed(8)},${longitude.toFixed(8)}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${parameters.toString()}`;
};
