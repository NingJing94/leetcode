/* eslint-disable no-console */
/* eslint-disable no-useless-return */
/* eslint-disable no-underscore-dangle */

// ref: https://es6.ruanyifeng.com/#docs/promise
// ref: https://juejin.im/post/6844904096525189128#heading-7

const PENDING = 'pending';
const FULLFILLED = 'fullfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._resolveQueue = [];
    this._rejectQueue = [];

    // resolve和reject方法的作用是改变promise状态
    const _resolve = (val) => {
      const run = () => {
        if (this._status !== PENDING) return;
        this._status = FULLFILLED;
        this._value = val;
        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift();
          callback(val);
        }
      };
      setTimeout(run); // 套一层setTimeout是为了保证先执行then里的依赖收集，后执行回调
    };

    const _reject = (val) => {
      const run = () => {
        if (this._status !== PENDING) return;
        this._status = REJECTED;
        this._value = val;
        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift();
          callback(val);
        }
      };
      setTimeout(run);
    };

    try {
      executor(_resolve, _reject);
    } catch (e) {
      _reject(e);
    }
  }

  // then方法的作用是为promise实例添加状态改变时的回调(收集依赖)，并且会返回一个新的promise实例
  then(resolveFn, rejectFn) {
    typeof resolveFn !== 'function' ? resolveFn = (val) => val : null;
    typeof rejectFn !== 'function' ? rejectFn = (error) => {
      throw new Error(error instanceof Error ? error.message : error);
    } : null;
    return new MyPromise((resolve, reject) => {
      const fullfilledFn = (val) => {
        try {
          const res = resolveFn(val);
          res instanceof MyPromise ? res.then(resolve, reject) : resolve(res);
        } catch (e) {
          reject(e);
        }
      };

      const rejectedFn = (error) => {
        try {
          const res = rejectFn(error);
          res instanceof MyPromise ? res.then(resolve, reject) : resolve(res); // why resolve?
        } catch (e) {
          rejectFn(e);
        }
      };

      switch (this._status) {
        case PENDING:
          this._resolveQueue.push(fullfilledFn);
          this._rejectQueue.push(rejectedFn);
          break;
        // 如果状态已经是resolved则执行回调
        case FULLFILLED:
          fullfilledFn(this._value); // this._value是上一个then回调的返回值
          break;
        case REJECTED:
          rejectedFn(this._value);
          break;
        default:
          break;
      }
    });
  }

  // 等价于以下写法
  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }

  // 不管最终Promise变为什么状态都会执行
  finally(callback) {
    return this.then(
      (val) => MyPromise.resolve(callback()).then(() => val),
      (err) => MyPromise.resolve(callback()).then(() => { throw err; }),
    );
  }

  static resolve(val) {
    if (val instanceof MyPromise) { return val; }
    return new MyPromise((resolve) => { resolve(val); });
  }

  static reject(err) {
    return new MyPromise((resolve, reject) => { reject(err); });
  }

  // 将多个Promise封装成一个新的Promise对象
  // 只有当所有Promise都resolve了，新的Promise才能resolve，将各个Promise resolve的结果组成一个数组resolve出去
  // 但只要当有其中一个Promise变成rejected，新的Promise直接reject
  static all(promiseArr) {
    let index = 0;
    const result = [];
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (val) => {
            index += 1;
            result[i] = val;
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          (err) => {
            reject(err);
          },
        );
      });
    });
  }

  // 返回新的Promise对象，关注任何一个Promise先resolve/reject
  // 只要入参任何一个Promise实例变成fulfilled状态，包装实例就会变成fulfilled状态
  // 只要入参任何一个Promise实例变成rejected状态，包装实例就会变成rejected状态
  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p) => { // for of 和forEach的区别？？？
        MyPromise.resolve(p).then(
          (val) => { resolve(val); },
          (err) => { reject(err); },
        );
      });
    });
  }

  // 返回一个新的Promise对象，关注任何一个先resolve或直到所有reject
  // 只要参数实例有一个变成fulfilled状态，包装实例就会变成fulfilled状态
  // 如果所有参数实例都变成rejected状态，包装实例就会变成rejected状态
  static any(promiseArr) {
    let index = 0;
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p) => {
        MyPromise.resolve(p).then(
          (val) => { resolve(val); },
          (err) => {
            index += 1;
            if (index === promiseArr.length) {
              reject(err);
            } else {
              resolve(err);
            }
          },
        );
      });
    });
  }

  // 返回一个新的Promise对象
  // 等所有实例都返回结果，不管是fullfilled还是rejected，新的Promise回调收到一个数组
  // 数组对象对应入参的各个Promise，数组元素结构为{status: 'fullfilled', value: 'val'}
  static allSettled(promiseArr) {
    const result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (val) => {
            index += 1;
            result[i] = {
              status: 'fullfilled',
              value: val,
            };
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          (err) => {
            index += 1;
            result[i] = {
              status: 'rejected',
              value: err,
            };
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
        );
      });
    });
  }
}

const p1 = new MyPromise((resolve) => {
  resolve(1); // 同步executor测试
});

p1.then((res) => {
  console.log(res);
  return 2; // 链式调用测试
})
  .then() // 值穿透测试
  .then((res) => {
    console.log(res);
    return new MyPromise((resolve) => {
      resolve(3); // 返回Promise测试
    });
  })
  .then((res) => {
    console.log(res);
    throw new Error('reject测试'); // reject测试
  })
  .catch((err) => {
    console.log(err);
  });

MyPromise.resolve('ok')
  .finally(() => MyPromise.reject('这里只有返回被拒绝的 promise 或者 throw 一个错误，才会影响当前 finally 返回的新 promise 的决议'))
  .then((value) => {
    console.log('成功', value);
  }, (err) => {
    console.log('失败', err);
  });
