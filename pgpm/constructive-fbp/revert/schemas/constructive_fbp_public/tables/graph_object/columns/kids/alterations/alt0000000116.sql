-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/kids/alterations/alt0000000116


ALTER TABLE "constructive_fbp_public".graph_object 
  DROP CONSTRAINT graph_objects_kids_ktree_chk;


