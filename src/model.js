export default class BaseModel {

  constructor( app, data = {} ) {

    // Expose a reference to the Kudu app. This is important because instances
    // have methods ('save' for example) that perform data access.
    this.app = app;

    // If an initial data object is provided to a model constructor the
    // properties of that object are mapped onto the resulting instance. The
    // relationships of the model are used to determine whether a particular key
    // refers to a nested model instance. Any nested instances are recursively
    // instantiated.
    const relationships = this.constructor.schema.relationships || {};

    Object.keys(data).forEach(( key ) => {

      const relationship = relationships[ key ];
      const value = data[ key ];
      let NestedModel;

      if (
        relationship &&
        ( NestedModel = app.getModel(relationship.type) ) &&
        typeof value === 'object' &&
        value
      ) {

        // If the initial data is an array we attempt to map it to an array of
        // corresponding nested model instances. Otherwise it should be an
        // object which can be instantiated itself.
        if ( Array.isArray(value) ) {

          this[ key ] = value.map(( item ) => {

            if ( typeof item === 'object' && item ) {
              return new NestedModel(item);
            }

            return item;
          });
        } else {
          this[ key ] = new NestedModel(value);
        }

      } else {
        this[ key ] = value;
      }
    });

    // Any properties that are present in the schema but not provided by the
    // initial data object are set to their default values where possible.
    const properties = this.constructor.schema.properties || {};

    Object.keys(properties).forEach(( key ) => {

      const value = properties[ key ].default;

      if ( value && this[ key ] === undefined ) {
        this[ key ] = value;
      }
    });
  }

  // Prepare a model instance for serialisation to a JSON string. We make a
  // shallow clone of the instance and then remove the reference to the Kudu
  // application. The clone is necessary so the original instance keeps its
  // reference to the app.
  toJSON() {

    const obj = Object.assign({}, this);
    delete obj.app;

    return obj;
  }

}
