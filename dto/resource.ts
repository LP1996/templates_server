export class ResourceListDTO {
  public name: string
  public description: string

  constructor(name: string, desctiption: string) {
    this.name = name;
    this.description = desctiption
  }
}