export const RawFilter = (rd) => {
  return {
    _obj: "Adobe Camera Raw Filter",
    $CrVe: "15.5",
    $PrVN: 6,
    $PrVe: 251920384,
    $WBal: {
      _enum: "$WBal",
      _value: "customEnum",
    },
    $Temp: 0,
    $Tint: 0,
    $CrTx: rd.texture, //texture
    $Cl12: rd.clarity, //clarity
    $Vibr: 0, //vibrance
    saturation: 0, //saturation
    sharpen: rd.sharpen, //sharpen
    $ShpR: 1, //radius
    $ShpD: 25, // detail
    $ShpM: 0, //masking
    $LNR: rd.noise_reduction, //noise reduct
    $LNRD: 50,
    $LNRC: 0,
    $CNR: 0, //color noise reduct
    $CNRD: 50,
    $CNRS: 50,
    $TMMs: 0,
    $PGTM: 0,
    RGBSetupClass: 0,
  };
};

export const OilPaint = (rd) => {
  return {
    _obj: "oilPaint",
    lightingOn: true,
    stylization: rd.stylization / 10,
    cleanliness: rd.cleanliness / 10,
    brushScale: 1, //rd.brushScale / 10,
    microBrush: 0, //rd.microBrush / 10,
    lightDirection: -60,
    specularity: 0.1,
  };
};

export const ShadowHightlight = (shadow, hightlight) => {
  return {
    _obj: "adaptCorrect",
    shadowMode: {
      _obj: "adaptCorrectTones",
      amount: {
        _unit: "percentUnit",
        _value: shadow,
      },
      width: {
        _unit: "percentUnit",
        _value: 50,
      },
      radius: 30,
    },
    highlightMode: {
      _obj: "adaptCorrectTones",
      amount: {
        _unit: "percentUnit",
        _value: hightlight,
      },
      width: {
        _unit: "percentUnit",
        _value: 50,
      },
      radius: 30,
    },
    blackClip: 0.01,
    whiteClip: 0.01,
    center: 0,
    colorCorrection: 20,
    _isCommand: true,
  };
};
export const SmartSharpen = (amount, radius, noise_reduction) => {
  return {
    _obj: "smartSharpen",
    presetKind: {
      _enum: "presetKindType",
      _value: "presetKindCustom",
    },
    useLegacy: false,
    amount: {
      _unit: "percentUnit",
      _value: amount,
    },
    radius: {
      _unit: "pixelsUnit",
      _value: radius,
    },
    noiseReduction: {
      _unit: "percentUnit",
      _value: noise_reduction,
    },
    blur: {
      _enum: "blurType",
      _value: "lensBlur",
    },
  };
};

export const SurfaceBlur = (radius, threshold) => {
  return {
    _obj: "surfaceBlur",
    radius: {
      _unit: "pixelsUnit",
      _value: radius,
    },
    threshold: threshold,
  };
};

export const AccentedEdges = (edgeWidth, edgeBrightness, smoothness) => {
  return {
    _obj: "$GEfc",
    $GEfk: {
      _enum: "$GEft",
      _value: "accentedEdges",
    },
    edgeWidth: edgeWidth,
    edgeBrightness: edgeBrightness,
    smoothness: smoothness,
  };
};

export const AddNoise = (noise) => {
  return {
    _obj: "addNoise",
    distort: {
      _enum: "distort",
      _value: "uniformDistribution",
    },
    noise: {
      _unit: "percentUnit",
      _value: noise,
    },
    monochromatic: true,
    $FlRs: 204617,
  };
};

export const HighPass = (value) => {
  return {
    _obj: "highPass",
    radius: {
      _unit: "pixelsUnit",
      _value: value,
    },
  };
};

export const Texturize = (scaling, relief) => {
  return {
    _obj: "$GEfc",
    $GEfk: {
      _enum: "$GEft",
      _value: "texturizer",
    },
    textureType: {
      _enum: "textureType",
      _value: "texTypeSandstone",
    },
    scaling: scaling,
    relief: relief,
    lightDirection: {
      _enum: "lightDirection",
      _value: "lightDirTop",
    },
    invertTexture: false,
    _isCommand: true,
  };
};
