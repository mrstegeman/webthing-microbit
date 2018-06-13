const {
  Event,
  Property,
  SingleThing,
  Thing,
  Value,
  WebThingServer,
} = require('webthing');
const BBCMicrobit = require('bbc-microbit');

console.log('Scanning for microbit');

function run_server(microbit) {
  console.log(`Discovered: id=${microbit.id} address=${microbit.address}`);

  microbit.on('disconnect', () => {
    console.log('Disconnected!');
  });

  const thing = new Thing('microbit', 'thing', 'A WoT-connected micro:bit');

  const temperatureProperty = new Property(
    thing,
    'temperature',
    new Value(0),
    {
      type: 'number',
      unit: 'celsius',
      description: 'An ambient temperature sensor',
    });
  thing.addProperty(temperatureProperty);

  const accelerometerXProperty = new Property(
    thing,
    'accelerometerX',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      description: 'Accelerometer reading, X direction',
    });
  thing.addProperty(accelerometerXProperty);

  const accelerometerYProperty = new Property(
    thing,
    'accelerometerY',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      description: 'Accelerometer reading, Y direction',
    });
  thing.addProperty(accelerometerYProperty);

  const accelerometerZProperty = new Property(
    thing,
    'accelerometerZ',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      description: 'Accelerometer reading, Z direction',
    });
  thing.addProperty(accelerometerZProperty);

  const magnetometerXProperty = new Property(
    thing,
    'magnetometerX',
    new Value(0),
    {
      type: 'number',
      unit: 'microtesla',
      description: 'Magnetometer reading, X direction',
    });
  thing.addProperty(magnetometerXProperty);

  const magnetometerYProperty = new Property(
    thing,
    'magnetometerY',
    new Value(0),
    {
      type: 'number',
      unit: 'microtesla',
      description: 'Magnetometer reading, Y direction',
    });
  thing.addProperty(magnetometerYProperty);

  const magnetometerZProperty = new Property(
    thing,
    'magnetometerZ',
    new Value(0),
    {
      type: 'number',
      unit: 'microtesla',
      description: 'Magnetometer reading, Z direction',
    });
  thing.addProperty(magnetometerZProperty);

  const magnetometerBearingProperty = new Property(
    thing,
    'magnetometerBearing',
    new Value(0),
    {
      type: 'number',
      unit: 'radian',
      description: 'Magnetometer bearing',
    });
  thing.addProperty(magnetometerBearingProperty);

  const ledTextProperty = new Property(
    thing,
    'ledText',
    new Value('', (value) => {
      microbit.writeLedText(value, (error) => {
        if (error) {
          console.log('Failed to set LED text:', error);
        }
      });
    }),
    {
      type: 'string',
    });
  thing.addProperty(ledTextProperty);

  microbit.ledLoop = null;
  function loopDisplay() {
    const value = ledTextProperty.getValue();
    ledTextProperty.setValue(value);
  }

  const ledScrollDelayProperty = new Property(
    thing,
    'ledScrollDelay',
    new Value(1, (value) => {
      microbit.writeLedScrollingDelay(value, (error) => {
        if (error) {
          console.log('Failed to set LED scroll delay:', error);
        }
      });
    }),
    {
      type: 'number',
      minimum: 0,
      unit: 'millisecond',
    });
  thing.addProperty(ledScrollDelayProperty);

  const ledLoopProperty = new Property(
    thing,
    'ledLoop',
    new Value(false, (value) => {
      if (value) {
        const delay = ledScrollDelayProperty.getValue() *
          ledTextProperty.getValue().length;
        microbit.ledLoop = setInterval(loopDisplay, delay);
      } else if (microbit.ledLoop !== null) {
        clearInterval(microbit.ledLoop);
        microbit.ledLoop = null;
      }
    }),
    {
      type: 'boolean',
    });
  thing.addProperty(ledLoopProperty);

  microbit.connectAndSetUp((error) => {
    if (error) {
      console.log('Failed to connect:', error);
      return;
    }

    microbit.readLedScrollingDelay((error, delay) => {
      if (error) {
        console.log('Failed to read LED scroll delay:', error);
        return;
      }

      ledScrollDelayProperty.value.notifyOfExternalUpdate(delay);
    });

    microbit.writeTemperaturePeriod(1000, (error) => {
      if (error) {
        console.log('Failed to configure temperature sensor:', error);
      }
    });

    microbit.subscribeTemperature((error) => {
      if (error) {
        console.log('Failed to subscribe to temperature updates:', error);
      }
    });

    microbit.on('temperatureChange', (value) => {
      temperatureProperty.value.notifyOfExternalUpdate(value);
    });

    microbit.writeAccelerometerPeriod(640, (error) => {
      if (error) {
        console.log('Failed to configure accelerometer:', error);
      }
    });

    microbit.subscribeAccelerometer((error) => {
      if (error) {
        console.log('Failed to subscribe to accelerometer updates:', error);
      }
    });

    microbit.on('accelerometerChange', (x, y, z) => {
      accelerometerXProperty.value.notifyOfExternalUpdate(x);
      accelerometerYProperty.value.notifyOfExternalUpdate(y);
      accelerometerZProperty.value.notifyOfExternalUpdate(z);
    });

    microbit.writeMagnetometerPeriod(640, (error) => {
      if (error) {
        console.log('Failed to configure magnetometer:', error);
      }
    });

    microbit.subscribeMagnetometer((error) => {
      if (error) {
        console.log('Failed to subscribe to magnetometer updates:', error);
      }
    });

    microbit.subscribeMagnetometerBearing((error) => {
      if (error) {
        console.log('Failed to subscribe to magnetometer bearing updates:',
                    error);
      }
    });

    microbit.on('magnetometerChange', (x, y, z) => {
      magnetometerXProperty.value.notifyOfExternalUpdate(x);
      magnetometerYProperty.value.notifyOfExternalUpdate(y);
      magnetometerZProperty.value.notifyOfExternalUpdate(z);
    });

    microbit.on('magnetometerBearingChange', (bearing) => {
      magnetometerBearingProperty.value.notifyOfExternalUpdate(bearing);
    });

    microbit.subscribeButtons((error) => {
      if (error) {
        console.log('Failed to subscribe to button updates:', error);
      }
    });

    microbit.on('buttonAChange', (state) => {
      console.log('buttonA:', state);
      thing.addEvent(new Event(thing, 'buttonA', state));
    });

    microbit.on('buttonBChange', (state) => {
      console.log('buttonB:', state);
      thing.addEvent(new Event(thing, 'buttonB', state));
    });
  });

  thing.addAvailableEvent('buttonA', {
    description: 'Button A state changed',
    type: 'integer',
  });
  thing.addAvailableEvent('buttonB', {
    description: 'Button B state changed',
    type: 'integer',
  });

  setTimeout(() => {
    const server = new WebThingServer(new SingleThing(thing), 8888);
    server.start();
  }, 5000);
}

BBCMicrobit.discover(run_server);
