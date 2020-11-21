const db = require('../database');
const { uploader } = require('../helper/uploader');
const { asyncQuery } = require('../helper/query');

module.exports = {
  getProducts: async (req, res) => {
    try {
      let sqlGet = req.query.idcategory
        ? `Select * from tbproducts tp
            left join product_category pc
            on tp.idproduct = pc.idproduct
            where pc.idcategory = ${db.escape(req.query.idcategory)}`
        : `Select * from tbproducts`;

      let get = await asyncQuery(sqlGet);
      res.status(200).send(get);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // getProducts: (req, res) => {
  //   // console.log('query', req.query.idcategory, !req.query.idcategory);
  //   // req.query.idcategory ? console.log('ada') : console.log('tidak ada');
  //   let sqlGet = req.query.idcategory
  //     ? `Select * from tbproducts tp
  //           left join product_category pc
  //           on tp.idproduct = pc.idproduct
  //           where pc.idcategory = ${db.escape(req.query.idcategory)}`
  //     : `Select * from tbproducts`;

  //   db.query(sqlGet, (err, results) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send(err);
  //     }

  //     // console.log(results);
  //     res.status(200).send(results);
  //   });
  // },

  getRootCat: (req, res) => {
    let sqlGet = `Select * from tbcategory where parentId is null`;

    db.query(sqlGet, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      // console.log(results);
      res.status(200).send(results);
    });
  },

  getLeafCat: (req, res) => {
    let sqlGet = `Select tb1.idcategory, tb1.category from tbcategory tb1 
                    left join tbcategory tb2
                    on tb2.parentId = tb1.idcategory
                    where tb2.idcategory is null`;

    db.query(sqlGet, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      // console.log(results);
      res.status(200).send(results);
    });
  },

  addProduct: (req, res) => {
    // console.log('===>', req.body.data, req.params);
    try {
      let sqlInsert = `insert into tbproducts set ?`;
      let sqlGetCat = `with recursive category_path(idcategory, category, parentId) as
                        (
                            select idcategory, category, parentId
                                from tbcategory
                                where idcategory = ${req.params.leafnode}
                            union all
                            select tbc.idcategory, tbc.category, tbc.parentId
                                from category_path cp join tbcategory tbc
                                on cp.parentId = tbc.idcategory
                        )
                        select * from category_path;`;

      let path = '/images';

      const upload = uploader(path, 'file').fields([{ name: 'file' }]);
      // start upload method
      upload(req, res, (error) => {
        if (error) {
          console.log(error);
          res.status(500).send(error);
        }

        const { file } = req.files;
        const filepath = file ? path + '/' + file[0].filename : null;

        let data = JSON.parse(req.body.data);
        // console.log(data, filepath);
        data.image = filepath;

        let sqlInsertPr = `insert into product_category values `;

        db.query(sqlInsert, data, async (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          }

          if (results.insertId) {
            let getCat = await asyncQuery(sqlGetCat);
            if (getCat) {
              let data = [];
              getCat.forEach((element) => {
                data.push(`(null,${results.insertId}, ${element.idcategory})`);
              });

              let inpc = await asyncQuery(`${sqlInsertPr} ${data.toString()}`);
              res.status(200).send('Add product success');
            }
          }
        });
      });
      // end upload method
    } catch (error) {
      console.log(error);
    }
  },

  // addProduct: (req, res) => {
  //   // console.log('===>', req.body.data, req.params);
  //   try {
  //     let sqlInsert = `insert into tbproducts set ?`;
  //     let sqlGetCat = `with recursive category_path(idcategory, category, parentId) as
  //                       (
  //                           select idcategory, category, parentId
  //                               from tbcategory
  //                               where idcategory = ${req.params.leafnode}
  //                           union all
  //                           select tbc.idcategory, tbc.category, tbc.parentId
  //                               from category_path cp join tbcategory tbc
  //                               on cp.parentId = tbc.idcategory
  //                       )
  //                       select * from category_path;`;

  //     let path = '/images';

  //     const upload = uploader(path, 'file').fields([{ name: 'file' }]);

  //     upload(req, res, (error) => {
  //       if (error) {
  //         console.log(error);
  //         res.status(500).send(error);
  //       }

  //       const { file } = req.files;
  //       const filepath = file ? path + '/' + file[0].filename : null;

  //       let data = JSON.parse(req.body.data);
  //       // console.log(data, filepath);

  //       data.image = filepath;

  //       db.query(sqlInsert, data, (err, results) => {
  //         if (err) {
  //           console.log(err);
  //           res.status(500).send(err);
  //         }

  //         db.query(sqlGetCat, (errGet, resGet) => {
  //           if (errGet) {
  //             console.log(errGet);
  //             res.status(500).send(errGet);
  //           }
  //           // console.log(resGet);
  //           let sqlInsertPr = `insert into product_category values `;
  //           let data = [];
  //           resGet.forEach((element) => {
  //             data.push(`(null,${results.insertId}, ${element.idcategory})`);
  //           });

  //           db.query(sqlInsertPr + data.toString(), (errIn, resIn) => {
  //             if (errIn) {
  //               console.log(errIn);
  //               res.status(500).send(errIn);
  //             }
  //             res.status(200).send(results);
  //           });
  //         });
  //       });
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
};
