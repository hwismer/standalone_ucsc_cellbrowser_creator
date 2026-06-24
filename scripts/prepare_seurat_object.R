library(Seurat)

rds_path <- "/Users/hwismer/IPISRC044_merged_coarse_annot.rds"
save_rds_path <- "/Users/hwismer/test.rds"
ident_to_use <- "coarse_annot"

sobj <- readRDS(rds_path)
Idents(sobj) <- ident_to_use
sobj <- PrepSCTFindMarkers(sobj)
sobj@misc$markers<- FindAllMarkers(sobj, test.use="poisson", only.pos=TRUE, logfc.threshold = 1, min.pct = .25)
saveRDS(sobj, save_rds_path)
