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

  const thing = new Thing(
    `urn:dev:micro:bit:${microbit.id}`,
    'micro:bit',
    [
      'TemperatureSensor',
      'PushButton',
    ],
    'A WoT-connected micro:bit'
  );

  const temperatureProperty = new Property(
    thing,
    'temperature',
    new Value(0),
    {
      '@type': 'TemperatureProperty',
      type: 'integer',
      unit: 'degree celsius',
      title: 'Temperature',
      description: 'An ambient temperature sensor',
      readOnly: true,
    }
  );
  thing.addProperty(temperatureProperty);

  const accelerometerXProperty = new Property(
    thing,
    'accelerometerX',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      title: 'Accelerometer (X)',
      description: 'Accelerometer reading, X direction',
      readOnly: true,
    }
  );
  thing.addProperty(accelerometerXProperty);

  const accelerometerYProperty = new Property(
    thing,
    'accelerometerY',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      title: 'Accelerometer (Y)',
      description: 'Accelerometer reading, Y direction',
      readOnly: true,
    }
  );
  thing.addProperty(accelerometerYProperty);

  const accelerometerZProperty = new Property(
    thing,
    'accelerometerZ',
    new Value(0),
    {
      type: 'number',
      unit: 'G',
      title: 'Accelerometer (Z)',
      description: 'Accelerometer reading, Z direction',
      readOnly: true,
    }
  );
  thing.addProperty(accelerometerZProperty);

  const magnetometerXProperty = new Property(
    thing,
    'magnetometerX',
    new Value(0),
    {
      type: 'number',
      unit: 'µT',
      title: 'Magnetometer (X)',
      description: 'Magnetometer reading, X direction',
      readOnly: true,
    }
  );
  thing.addProperty(magnetometerXProperty);

  const magnetometerYProperty = new Property(
    thing,
    'magnetometerY',
    new Value(0),
    {
      type: 'number',
      unit: 'µT',
      title: 'Magnetometer (Y)',
      description: 'Magnetometer reading, Y direction',
      readOnly: true,
    }
  );
  thing.addProperty(magnetometerYProperty);

  const magnetometerZProperty = new Property(
    thing,
    'magnetometerZ',
    new Value(0),
    {
      type: 'number',
      unit: 'µT',
      title: 'Magnetometer (Z)',
      description: 'Magnetometer reading, Z direction',
      readOnly: true,
    }
  );
  thing.addProperty(magnetometerZProperty);

  const magnetometerBearingProperty = new Property(
    thing,
    'magnetometerBearing',
    new Value(0),
    {
      type: 'integer',
      unit: 'radian',
      title: 'Magnetometer Bearing',
      description: 'Magnetometer bearing',
      readOnly: true,
    }
  );
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
      title: 'LED Text',
      description: 'Text displayed on LED',
    }
  );
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
      title: 'LED Scroll Delay',
      description: 'LED scroll delay',
    }
  );
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
      '@type': 'BooleanProperty',
      type: 'boolean',
      title: 'Loop Text',
      description: 'Whether or not to loop LED text',
    }
  );
  thing.addProperty(ledLoopProperty);

  const buttonAProperty = new Property(
    thing,
    'buttonA',
    new Value(false),
    {
      '@type': 'PushedProperty',
      type: 'boolean',
      title: 'Button A',
      description: 'State of button A',
    }
  );
  thing.addProperty(buttonAProperty);

  const buttonBProperty = new Property(
    thing,
    'buttonB',
    new Value(false),
    {
      '@type': 'PushedProperty',
      type: 'boolean',
      title: 'Button B',
      description: 'State of button B',
    }
  );
  thing.addProperty(buttonBProperty);

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

    microbit.on('temperatureChange', (value) => {
      temperatureProperty.value.notifyOfExternalUpdate(parseInt(value));
    });

    microbit.writeTemperaturePeriod(1000, (error) => {
      if (error) {
        console.log('Failed to configure temperature sensor:', error);
      } else {
        microbit.subscribeTemperature((error) => {
          if (error) {
            console.log('Failed to subscribe to temperature updates:', error);
          }
        });
      }
    });

    microbit.on('accelerometerChange', (x, y, z) => {
      accelerometerXProperty.value.notifyOfExternalUpdate(x);
      accelerometerYProperty.value.notifyOfExternalUpdate(y);
      accelerometerZProperty.value.notifyOfExternalUpdate(z);
    });

    microbit.writeAccelerometerPeriod(640, (error) => {
      if (error) {
        console.log('Failed to configure accelerometer:', error);
      } else {
        microbit.subscribeAccelerometer((error) => {
          if (error) {
            console.log('Failed to subscribe to accelerometer updates:', error);
          }
        });
      }
    });

    microbit.on('magnetometerChange', (x, y, z) => {
      magnetometerXProperty.value.notifyOfExternalUpdate(x);
      magnetometerYProperty.value.notifyOfExternalUpdate(y);
      magnetometerZProperty.value.notifyOfExternalUpdate(z);
    });

    microbit.on('magnetometerBearingChange', (bearing) => {
      magnetometerBearingProperty.value.notifyOfExternalUpdate(
        parseInt(bearing)
      );
    });

    microbit.writeMagnetometerPeriod(640, (error) => {
      if (error) {
        console.log('Failed to configure magnetometer:', error);
      } else {
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
      }
    });

    microbit.subscribeButtons((error) => {
      if (error) {
        console.log('Failed to subscribe to button updates:', error);
      }
    });

    microbit.on('buttonAChange', (state) => {
      switch (state) {
        case 0:
          buttonAProperty.value.notifyOfExternalUpdate(false);
          break;
        case 1:
          buttonAProperty.value.notifyOfExternalUpdate(true);
          thing.addEvent(new Event(thing, 'buttonAPressed'));
          break;
        case 2:
          buttonAProperty.value.notifyOfExternalUpdate(true);
          thing.addEvent(new Event(thing, 'buttonALongPressed'));
          break;
      }
    });

    microbit.on('buttonBChange', (state) => {
      switch (state) {
        case 0:
          buttonBProperty.value.notifyOfExternalUpdate(false);
          break;
        case 1:
          buttonBProperty.value.notifyOfExternalUpdate(true);
          thing.addEvent(new Event(thing, 'buttonBPressed'));
          break;
        case 2:
          buttonBProperty.value.notifyOfExternalUpdate(true);
          thing.addEvent(new Event(thing, 'buttonBLongPressed'));
          break;
      }
    });
  });

  thing.addAvailableEvent('buttonAPressed', {
    description: 'Button A pressed',
    '@type': 'PressedEvent',
  });
  thing.addAvailableEvent('buttonALongPressed', {
    description: 'Button A long pressed',
    '@type': 'LongPressedEvent',
  });
  thing.addAvailableEvent('buttonBPressed', {
    description: 'Button B pressed',
    '@type': 'PressedEvent',
  });
  thing.addAvailableEvent('buttonBLongPressed', {
    description: 'Button B long pressed',
    '@type': 'LongPressedEvent',
  });

  setTimeout(() => {
    const server = new WebThingServer(new SingleThing(thing), 8888);
    server.start().catch(console.error);
  }, 5000);
}

BBCMicrobit.discover(run_server);
