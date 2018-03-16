/* tslint:disable:no-unused-expression */
import ServiceWorkerWebpackPlugin from './index';

function trim(str: string) {
  return str.replace(/^\s+|\s+$/, '');
}

const filename = 'sw.js';

describe('ServiceWorkerPlugin', () => {
  describe('options: filename', () => {
    it('should throw if trying to hash the filename', () => {
      expect(() => {
        // tslint-disable-next-line no-new
        new ServiceWorkerWebpackPlugin({
          filename: 'sw-[hash:7].js',
        });
      }).toThrow();
    });
  });

  describe('options: includes', () => {
    it('should allow to have a white list parameter', () => {
      const serviceWorkerPlugin = new ServiceWorkerWebpackPlugin({
        filename,
        includes: ['bar.*'],
      });

      const compilation = {
        assets: {
          [filename]: {
            source: () => '',
          },
          'bar.js': {},
          'foo.js': {},
        },
        getStats: () => ({
          toJson: () => ({}),
        }),
      };

      return serviceWorkerPlugin.handleEmit(
        compilation,
        {
          options: {},
        },
        () => {
          expect(compilation.assets[filename].source()).toEqual(
            trim(`
var serviceWorkerOption = {
  "assets": [
    "/bar.js"
  ]
};`)
          );
        }
      );
    });

    describe('options: transformOptions', () => {
      it('should be used', () => {
        const transformOptions = (serviceWorkerOption: any) => ({
          bar: 'foo',
          jsonStats: serviceWorkerOption.jsonStats,
        });

        const serviceWorkerPlugin = new ServiceWorkerWebpackPlugin({
          filename,
          transformOptions,
        });

        const compilation = {
          assets: {
            [filename]: {
              source: () => '',
            },
          },
          getStats: () => ({
            toJson: () => ({
              foo: 'bar',
            }),
          }),
        };

        return serviceWorkerPlugin.handleEmit(
          compilation,
          {
            options: {},
          },
          () => {
            expect(compilation.assets[filename].source()).toEqual(
              trim(`
var serviceWorkerOption = {
  "bar": "foo",
  "jsonStats": {
    "foo": "bar"
  }
};`)
            );
          }
        );
      });
    });
  });
});
