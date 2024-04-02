import { STORAGE, debugRawFilter } from "./psutils";

export default class RAWFilterConfig {
  all_config;

  constructor() {
    const config = localStorage.getItem(STORAGE.RAWFILTER_CONFIG);
    this.all_config = config != null ? JSON.parse(config) : [];
  }
  minimizeData(data) {
    const all_data = data.object;
    let remapdata = [];
    for (const dt of all_data) {
      const d = dt.data.reduce((a, b) => {
        a[b.name] = b.value;
        return a;
      }, {});
      remapdata.push({
        name: dt.name,
        data: d,
      });
    }

    return {
      name: data.name,
      id: data.id,
      data: remapdata,
    };
  }
  get() {
    return this.all_config;
  }
  findById(id) {
    this.all_config[this.all_config.findIndex((e) => e.id == id)];
  }
  insert(new_data) {
    const data = this.minimizeData(new_data);
    this.all_config.push(data);

    localStorage.setItem(
      STORAGE.RAWFILTER_CONFIG,
      JSON.stringify(this.all_config)
    );

    return this.all_config;
  }
  delete(selected) {
    const filtered = this.all_config.filter((rc) => rc.id != selected.id);
    localStorage.setItem(STORAGE.RAWFILTER_CONFIG, JSON.stringify(filtered));
    this.all_config = filtered;
    return this.all_config;
  }
  reset() {
    localStorage.removeItem(STORAGE.RAWFILTER_CONFIG);
  }
}
